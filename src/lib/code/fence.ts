import {
  CODE_ENVS,
  CODE_HUES,
  type CodeHue,
  type CodeLang,
  type CodeSnippet,
  isCodeEnv,
  isCodeLang,
} from './snippet.ts'

/*
 * Fence metadata to the code model. A fence such as
 *
 *   ```python title="rotate.py" {3-5} step=shear colors="A=blue v=orange" hover="A=matrix" check
 *
 * gives a snippet without its source. `step="columns rows"` ties one block to several steps, and
 * `focus="columns=6-7 rows=8"` highlights other lines in each of them. `env=spark` names the environment `scripts/run-code.mjs`
 * runs the block in, `check=torch` both names it and marks the block as checked, and
 * `raises=ValueError` names an exception the block raises on purpose. A fence in the language
 * `output` (or marked `output`) is the printed output of the block before it; `output excerpt`
 * shows only some of the printed lines, in order. Errors name the problem, so a typo fails the build
 * instead of being ignored.
 */

const ALIASES: Readonly<Record<string, CodeLang>> = {
  py: 'python',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  txt: 'text',
  plaintext: 'text',
}

export type FenceInfo =
  | { kind: 'output'; excerpt: boolean }
  | { kind: 'code'; snippet: Omit<CodeSnippet, 'source'> }
  | { kind: 'error'; message: string }

const PART = /\{([^}]*)\}|([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g

/** `"3-5,8"` to `[3, 4, 5, 8]`, or undefined when a range is malformed. */
export const parseLineRanges = (spec: string): number[] | undefined => {
  const lines = new Set<number>()
  for (const part of spec.split(',').map((p) => p.trim())) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(part)
    if (!m) return undefined
    const from = Number(m[1])
    const to = Number(m[2] ?? m[1])
    if (from < 1 || to < from) return undefined
    for (let k = from; k <= to; k++) lines.add(k)
  }
  return [...lines].sort((a, b) => a - b)
}

/** `"A=blue v=orange"` to `{ A: 'blue', v: 'orange' }`, or undefined when a pair is malformed. */
const parsePairs = (spec: string): Record<string, string> | undefined => {
  const pairs: Record<string, string> = {}
  for (const part of spec.trim().split(/\s+/).filter(Boolean)) {
    const m = /^([^=\s]+)=([^=\s]+)$/.exec(part)
    if (!m) return undefined
    pairs[m[1]!] = m[2]!
  }
  return pairs
}

export const parseFence = (
  lang: string | null | undefined,
  meta: string | null | undefined,
): FenceInfo => {
  const rawLang = (lang ?? 'text').toLowerCase()
  const parts = [...(meta ?? '').matchAll(PART)]
  if (rawLang === 'output' || parts.some((p) => p[0] === 'output')) {
    return { kind: 'output', excerpt: parts.some((p) => p[0] === 'excerpt') }
  }
  const resolved = ALIASES[rawLang] ?? rawLang
  if (!isCodeLang(resolved)) return { kind: 'error', message: `unknown code language "${rawLang}"` }

  const snippet: { -readonly [K in keyof Omit<CodeSnippet, 'source'>]: CodeSnippet[K] } = {
    lang: resolved,
  }
  for (const [whole, range, key, dq, sq, bare] of parts) {
    const value = dq ?? sq ?? bare
    if (range !== undefined) {
      const lines = parseLineRanges(range)
      if (!lines) return { kind: 'error', message: `bad line range "${whole}"` }
      snippet.highlight = lines
      continue
    }
    switch (key) {
      case 'title':
      case 'tab':
        if (!value) return { kind: 'error', message: `"${key}" needs a value` }
        snippet[key] = value
        break
      case 'step': {
        const steps = value?.trim().split(/\s+/).filter(Boolean)
        if (!steps?.length) return { kind: 'error', message: '"step" needs a value' }
        snippet.steps = [...new Set(steps)]
        break
      }
      case 'focus': {
        const pairs = value === undefined ? undefined : parsePairs(value)
        if (!pairs || !Object.keys(pairs).length)
          return { kind: 'error', message: `bad focus "${whole}"` }
        const focus: Record<string, number[]> = {}
        for (const [step, spec] of Object.entries(pairs)) {
          const lines = parseLineRanges(spec)
          if (!lines) return { kind: 'error', message: `bad line range "${spec}" in focus` }
          focus[step] = lines
        }
        snippet.focus = focus
        break
      }
      case 'colors': {
        const pairs = value === undefined ? undefined : parsePairs(value)
        if (!pairs) return { kind: 'error', message: `bad colors "${whole}"` }
        const bad = Object.values(pairs).find((h) => !(CODE_HUES as readonly string[]).includes(h))
        if (bad)
          return { kind: 'error', message: `unknown color "${bad}" (use ${CODE_HUES.join(', ')})` }
        snippet.colors = pairs as Record<string, CodeHue>
        break
      }
      case 'hover': {
        const pairs = value === undefined ? undefined : parsePairs(value)
        if (!pairs) return { kind: 'error', message: `bad hover "${whole}"` }
        snippet.hoverKeys = pairs
        break
      }
      case 'env':
      case 'check': {
        if (value === undefined && key === 'env')
          return { kind: 'error', message: '"env" needs a value' }
        if (key === 'check') snippet.check = true
        if (value === undefined) break
        if (!isCodeEnv(value))
          return {
            kind: 'error',
            message: `unknown environment "${value}" (use ${CODE_ENVS.join(', ')})`,
          }
        if (snippet.env && snippet.env !== value)
          return { kind: 'error', message: `two environments, "${snippet.env}" and "${value}"` }
        snippet.env = value
        break
      }
      case 'raises':
        if (!value) return { kind: 'error', message: '"raises" needs a value' }
        snippet.raises = value
        break
      default:
        return { kind: 'error', message: `unknown fence option "${whole}"` }
    }
  }
  const stray = Object.keys(snippet.focus ?? {}).find((s) => !snippet.steps?.includes(s))
  if (stray !== undefined)
    return { kind: 'error', message: `focus names "${stray}", which is not in "step"` }
  return { kind: 'code', snippet }
}
