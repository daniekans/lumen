// Fails when project text contains em dashes or phrases listed in docs/WRITING.md.
// Scans Markdown, MDX and source files (where captions, UI copy and comments live).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const ROOTS = ['src', 'docs', 'scripts', 'e2e', 'README.md', 'CLAUDE.md']
const EXTENSIONS = new Set(['.md', '.mdx', '.ts', '.tsx', '.css', '.mjs'])
// Files that quote the banned phrases on purpose.
const EXEMPT = new Set([join('scripts', 'lint-prose.mjs'), join('docs', 'WRITING.md')])

const BANNED = [
  { pattern: /—/, message: 'em dash (use a comma, colon, parentheses or a new sentence)' },
  { pattern: /\bdelve\b|\bdive (?:into|deep)\b/i, message: '"dive into" / "delve"' },
  { pattern: /\blet'?s explore\b/i, message: '"let\'s explore"' },
  { pattern: /\bin essence\b/i, message: '"in essence"' },
  { pattern: /\bit'?s worth noting\b/i, message: '"it\'s worth noting"' },
  {
    pattern: /\bfascinating\b|\bpowerful\b|\bseamless(?:ly)?\b|\bgame[- ]changer\b/i,
    message: 'hype word',
  },
  { pattern: /\bnot only\b[^.]*\bbut also\b/i, message: '"not only ... but also"' },
  { pattern: /\bat the end of the day\b|\bin today'?s world\b/i, message: 'filler phrase' },
]

const walk = (path) => {
  let stat
  try {
    stat = statSync(path)
  } catch {
    return []
  }
  if (stat.isFile()) return EXTENSIONS.has(extname(path)) ? [path] : []
  return readdirSync(path).flatMap((name) => walk(join(path, name)))
}

const problems = []
for (const file of ROOTS.flatMap(walk)) {
  if (EXEMPT.has(file)) continue
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const { pattern, message } of BANNED) {
        if (pattern.test(line)) problems.push(`${file}:${i + 1}  ${message}`)
      }
      // Prettier treats an MDX line that starts with an inline component as a block and splits
      // the paragraph around it. Keep at least one word before the tag on its line.
      if (extname(file) === '.mdx' && /^<(?:C|StepLink)[\s>]/.test(line))
        problems.push(
          `${file}:${i + 1}  inline component at the start of a line (Prettier splits the paragraph)`,
        )
    })
}

if (problems.length) {
  console.error(`Prose lint found ${problems.length} problem(s):\n${problems.join('\n')}`)
  process.exit(1)
}
console.log('Prose lint passed.')
