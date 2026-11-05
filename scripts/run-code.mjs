#!/usr/bin/env node
/*
 * Runs the code blocks of items, so output blocks come from real runs.
 *
 *   node scripts/run-code.mjs <item path>... [--env <env>] [--check] [--write] [--local]
 *   node scripts/run-code.mjs --all --check --env default --local     (the CI job)
 *
 * An item path is the content path (`/mathematics/linear-algebra/linear-maps/matrix-vector-product`)
 * or an `.mdx` file. Each MDX file of the item (`explanation.mdx`, `code.mdx`) runs as one script
 * per environment: its Python blocks in order, in one namespace, so later blocks see earlier
 * names. SQL blocks with `env=spark` run through `spark.sql`. Every environment is a Docker image
 * built once from `code-envs/<env>/` (tagged by a hash of its files) and reused; nothing is
 * installed per run. `torch` includes the `default` packages, so a run in `torch` also runs the
 * file's `default` blocks.
 *
 * Without flags it prints each block's output and whether it matches the output block.
 * --check   runs only blocks marked `check` and fails on a difference (CI).
 * --write   replaces differing output blocks with the real output (not `output excerpt` ones).
 * --env     runs only that environment.
 * --local   runs the default environment with the local `python3` instead of Docker.
 * --all     every MDX file under src/content.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFence } from '../src/lib/code/fence.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'src/content')
const envsDir = join(root, 'code-envs')

/** Environments: the blocks they also run, and the command that runs a script file. */
const ENVS = {
  default: { includes: ['default'], command: ['python3'] },
  torch: { includes: ['default', 'torch'], command: ['python3'] },
  spark: {
    includes: ['spark'],
    command: ['/opt/spark/bin/spark-submit', '--conf', 'spark.ui.enabled=false'],
  },
}

// ---------------------------------------------------------------- arguments

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(name)
  if (i >= 0) args.splice(i, 1)
  return i >= 0
}
const option = (name) => {
  const i = args.indexOf(name)
  if (i < 0) return undefined
  const [, value] = args.splice(i, 2)
  return value
}
const check = flag('--check')
const write = flag('--write')
const local = flag('--local')
const all = flag('--all')
const onlyEnv = option('--env')
if (onlyEnv && !ENVS[onlyEnv]) fail(`unknown environment "${onlyEnv}"`)
if (!all && args.length === 0) {
  console.log(
    'usage: node scripts/run-code.mjs <item path>... [--env e] [--check] [--write] [--local]',
  )
  process.exit(1)
}

function fail(message) {
  console.error(`run-code: ${message}`)
  process.exit(1)
}

// ---------------------------------------------------------------- files and blocks

const mdxFilesUnder = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return mdxFilesUnder(path)
    return name.endsWith('.mdx') ? [path] : []
  })

const filesOf = (arg) => {
  const path = resolve(root, arg)
  if (arg.endsWith('.mdx') && existsSync(path)) return [path]
  const dir = join(contentDir, arg.replace(/^\/+/, '').replace(/^src\/content\//, ''))
  if (!existsSync(dir)) fail(`no item at ${relative(root, dir)}`)
  return ['explanation.mdx', 'code.mdx'].map((f) => join(dir, f)).filter(existsSync)
}

/** Fences of an MDX file, with their line ranges (0-based, fence lines included). */
const fencesOf = (text) => {
  const lines = text.split('\n')
  const fences = []
  for (let i = 0; i < lines.length; i++) {
    const open = /^(\s*)(`{3,})([^\s`]*)\s*(.*)$/.exec(lines[i])
    if (!open) continue
    const [, , ticks, lang, meta] = open
    let end = i + 1
    while (end < lines.length && !new RegExp(`^\\s*${ticks}\\s*$`).test(lines[end])) end++
    fences.push({ lang, meta, start: i, end, source: lines.slice(i + 1, end).join('\n') })
    i = end
  }
  return { lines, fences }
}

/** The runnable blocks of a file, each with its output block (when there is one). */
const blocksOf = (file) => {
  const text = readFileSync(file, 'utf8')
  const { lines, fences } = fencesOf(text)
  const blocks = []
  let previous
  for (const fence of fences) {
    const info = parseFence(fence.lang || null, fence.meta)
    if (info.kind === 'error') fail(`${relative(root, file)}:${fence.start + 1}: ${info.message}`)
    if (info.kind === 'output') {
      const between = previous ? lines.slice(previous.fence.end + 1, fence.start) : []
      if (previous && between.every((l) => !l.trim()))
        previous.output = { ...fence, excerpt: info.excerpt }
      previous = undefined
      continue
    }
    const { snippet } = info
    const env = snippet.env ?? (snippet.lang === 'python' ? 'default' : undefined)
    const runnable =
      env && (snippet.lang === 'python' || (snippet.lang === 'sql' && env === 'spark'))
    previous = runnable
      ? { fence, env, lang: snippet.lang, snippet, line: fence.start + 1 }
      : undefined
    if (previous) blocks.push(previous)
  }
  return { text, blocks }
}

// ---------------------------------------------------------------- the driver

/*
 * The script that runs in the environment: each block in one shared namespace, its printed
 * output captured, then one JSON line with the results after a marker (Spark's own logs may
 * print before it). It stops at the first unexpected error.
 */
const MARKER = '@@lumen-run-code@@'
const driver = (blocks) => `import contextlib, io, json, traceback

BLOCKS = json.loads(${JSON.stringify(JSON.stringify(blocks))})
ns = {"__name__": "__main__"}
results = []


def run_sql(source):
    spark = ns.get("spark")
    if spark is None:
        from pyspark.sql import SparkSession
        spark = SparkSession.builder.getOrCreate()
    for statement in [s for s in source.split(";") if s.strip()]:
        df = spark.sql(statement)
        if statement.strip().upper().startswith("EXPLAIN"):
            print(df.first()[0])
        else:
            df.show(truncate=False)


for block in BLOCKS:
    out, error = io.StringIO(), None
    try:
        with contextlib.redirect_stdout(out):
            if block["lang"] == "sql":
                run_sql(block["source"])
            else:
                exec(compile(block["source"], block["name"], "exec"), ns)
        if block["raises"]:
            error = "expected " + block["raises"] + ", nothing was raised"
    except Exception as e:
        if type(e).__name__ != block["raises"]:
            error = "".join(traceback.format_exception(e))
    results.append({"output": out.getvalue(), "error": error})
    if error:
        break

print(${JSON.stringify(MARKER)})
print(json.dumps(results))
`

const imageOf = (env) => {
  const hash = createHash('sha256')
  for (const dir of new Set(['default', env])) {
    for (const name of readdirSync(join(envsDir, dir)).sort())
      hash.update(`${dir}/${name}\n`).update(readFileSync(join(envsDir, dir, name)))
  }
  const tag = `lumen-code-${env}:${hash.digest('hex').slice(0, 12)}`
  const exists = spawnSync('docker', ['image', 'inspect', tag], { stdio: 'ignore' }).status === 0
  if (!exists) {
    console.log(`Building ${tag} (once)...`)
    const build = spawnSync(
      'docker',
      ['build', '-t', tag, '-f', join(envsDir, env, 'Dockerfile'), envsDir],
      { stdio: 'inherit' },
    )
    if (build.status !== 0) fail(`could not build ${tag}`)
  }
  return tag
}

const hasDocker = () => spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0
const hasPython = () => {
  try {
    execFileSync('python3', ['-c', 'import numpy, sympy'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

let dockerChecked
/** Runs blocks in an environment and returns one result per block run. */
const runBlocks = (env, blocks) => {
  const script = driver(
    blocks.map((b) => ({
      lang: b.lang,
      source: b.fence.source,
      name: `${b.snippet.title ?? 'block'} (line ${b.line})`,
      raises: b.snippet.raises ?? null,
    })),
  )
  dockerChecked ??= !local && hasDocker()
  let command
  if (env === 'default' && (local || !dockerChecked)) {
    if (!hasPython()) {
      const why = local ? 'no' : 'no Docker, and no'
      return { skipped: `${why} local python3 with NumPy and SymPy` }
    }
    command = ['python3', ['-']]
  } else if (!dockerChecked) {
    return { skipped: local ? `--local runs only the default environment` : 'no Docker' }
  } else {
    const run = ['mkdir -p /tmp/run && cd /tmp/run && cat > run.py && exec', ...ENVS[env].command]
    command = ['docker', ['run', '--rm', '-i', imageOf(env), 'sh', '-c', `${run.join(' ')} run.py`]]
  }
  const started = Date.now()
  const result = spawnSync(command[0], command[1], { input: script, encoding: 'utf8' })
  const seconds = ((Date.now() - started) / 1000).toFixed(1)
  const at = result.stdout?.lastIndexOf(MARKER) ?? -1
  if (at < 0) {
    return { error: `${result.stderr ?? ''}${result.stdout ?? ''}`.trim().slice(-3000), seconds }
  }
  return { results: JSON.parse(result.stdout.slice(at + MARKER.length)), seconds }
}

// ---------------------------------------------------------------- comparing

const normalize = (s) =>
  s
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .replace(/^\n+|\n+$/g, '')

/** Whether the shown output matches the real one (in order, for an excerpt). */
const matches = (output, actual) => {
  const real = normalize(actual)
  if (!output) return real === ''
  const shown = normalize(output.source)
  if (!output.excerpt) return shown === real
  const realLines = real.split('\n')
  let at = 0
  for (const line of shown.split('\n')) {
    while (at < realLines.length && realLines[at] !== line) at++
    if (at === realLines.length) return false
    at++
  }
  return true
}

/** The file's text with differing output blocks replaced (or added). */
const rewrite = (text, outcomes) => {
  const lines = text.split('\n')
  for (const { block, actual } of [...outcomes].sort((a, b) => b.block.line - a.block.line)) {
    const real = normalize(actual)
    if (block.output) {
      if (block.output.excerpt) continue
      if (real)
        lines.splice(block.output.start + 1, block.output.end - block.output.start - 1, real)
      else lines.splice(block.output.start, block.output.end - block.output.start + 2)
    } else if (real) {
      lines.splice(block.fence.end + 1, 0, '', '```output', real, '```')
    }
  }
  return lines.join('\n')
}

// ---------------------------------------------------------------- main

const files = all ? mdxFilesUnder(contentDir) : args.flatMap(filesOf)
let failed = false
let ran = 0

for (const file of files) {
  const { text, blocks: allBlocks } = blocksOf(file)
  const blocks = allBlocks.filter((b) => !check || b.snippet.check)
  if (blocks.length === 0) continue
  const present = [...new Set(blocks.map((b) => b.env))]
  const envs = onlyEnv
    ? present.includes(onlyEnv)
      ? [onlyEnv]
      : []
    : present.filter((e) => !present.some((o) => o !== e && ENVS[o].includes.includes(e)))
  const outcomes = []
  for (const env of envs) {
    const own = blocks.filter((b) => ENVS[env].includes.includes(b.env))
    console.log(`\n${relative(root, file)} [${env}, ${own.length} blocks]`)
    const run = runBlocks(env, own)
    if (run.skipped) {
      console.log(`  skipped: ${run.skipped}`)
      if (process.env.CI) failed = true // CI must run what it checks
      continue
    }
    ran++
    if (run.error) {
      console.log(`  the run failed after ${run.seconds} s:\n${run.error}`)
      failed = true
      continue
    }
    run.results.forEach(({ output, error }, i) => {
      const block = own[i]
      const name = `${block.snippet.title ?? 'block'} (line ${block.line})`
      if (error) {
        console.log(`  ERROR ${name}\n${error}`)
        failed = true
        return
      }
      const same = matches(block.output, output)
      const status = same ? 'same' : block.output ? 'DIFFERS' : 'NO OUTPUT BLOCK'
      const excerpt = block.output?.excerpt ? ', excerpt' : ''
      console.log(`  ${status.padEnd(15)} ${name}${excerpt}`)
      if (!same) {
        outcomes.push({ block, actual: output })
        if (check) failed = true
      }
      if (!check && (!same || !write)) {
        const shown = normalize(output)
        if (shown) console.log(shown.replace(/^/gm, '    | '))
      }
    })
    console.log(`  ${run.seconds} s`)
  }
  if (write && outcomes.length > 0) {
    writeFileSync(file, rewrite(text, outcomes))
    const left = outcomes.filter((o) => o.block.output?.excerpt).length
    console.log(
      `  wrote ${outcomes.length - left} output blocks` +
        (left ? `; edit ${left} excerpts by hand` : ''),
    )
  }
}

if (ran === 0) console.log('run-code: nothing ran.')
process.exit(failed ? 1 : 0)
