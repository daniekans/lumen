// Lists user-facing strings that are hard-coded in UI code instead of coming from `@/i18n`.
//   node scripts/ui-strings.mjs            list every string, grouped by file
//   node scripts/ui-strings.mjs --summary  count per file
//   node scripts/ui-strings.mjs --check    fail when any string is found (run by `pnpm lint`)
// A string counts as copy when it is JSX text, or a literal that reads like words (a capital
// followed by a lowercase letter, or two words separated by a space). Mark a deliberate exception
// with a `// i18n-ignore` comment on the line or the line above.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

const ROOTS = [
  'src/ui',
  'src/practice',
  'src/app',
  'src/progress',
  'src/catalog',
  'src/viz-kit/runtime',
]
// build.ts reports broken content folders to developers, in the console.
const SKIP = [/\.test\.tsx?$/, /\.d\.ts$/, /catalog\/build\.ts$/]

// JSX attributes whose values are never shown to the learner.
const CODE_ATTRS = new Set([
  'className',
  'id',
  'key',
  'to',
  'href',
  'src',
  'type',
  'role',
  'name',
  'variant',
  'size',
  'tone',
  'kind',
  'side',
  'align',
  'mode',
  'as',
  'rel',
  'target',
  'step',
  'd',
  'fill',
  'stroke',
  'transform',
  'viewBox',
  'style',
  'path',
  'element',
  'virtual-keyboard-mode',
])
// Calls whose string arguments are for developers.
const CODE_CALLS = new Set([
  'console.log',
  'console.warn',
  'console.error',
  'console.info',
  'console.debug',
  'clsx',
  'querySelector',
  'querySelectorAll',
  'addEventListener',
  'removeEventListener',
  'setAttribute',
  'getAttribute',
  'createElement',
  'matchMedia',
  'getPropertyValue',
  'setProperty',
  'useParams',
  'useSearchParams',
  'import',
  'require',
])

const looksLikeWords = (s) => {
  const t = s.trim()
  if (!/[A-Za-z]/.test(t)) return false
  if (/^(?:[a-z-]+:|\.|#|\/|@|var\(|https?:|[a-z]+\/)/.test(t)) return false // css, paths, urls
  if (/[{}\\]|=>/.test(t)) return false // TeX or code
  return /^[A-Z][a-z]/.test(t) || /[A-Za-z]{2,}[,.]? [A-Za-z]{2,}/.test(t)
}

const walk = (path) => {
  const stat = statSync(path)
  if (stat.isFile()) return /\.tsx?$/.test(path) && !SKIP.some((r) => r.test(path)) ? [path] : []
  return readdirSync(path).flatMap((name) => walk(join(path, name)))
}

const calleeName = (call) => {
  const e = call.expression
  if (e.kind === ts.SyntaxKind.ImportKeyword) return 'import'
  if (ts.isIdentifier(e)) return e.text
  if (ts.isPropertyAccessExpression(e)) {
    const obj = ts.isIdentifier(e.expression) ? `${e.expression.text}.` : ''
    return CODE_CALLS.has(`${obj}${e.name.text}`) ? `${obj}${e.name.text}` : e.name.text
  }
  return ''
}

/**
 * Where a string literal sits: `code` (its text is never shown), `child` (rendered as an element's
 * content, so even one lowercase word is copy) or `other`.
 */
const position = (node) => {
  for (let n = node, parent = node.parent; parent; n = parent, parent = parent.parent) {
    if (ts.isTypeNode(parent) || ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent))
      return 'code'
    if (ts.isPropertyAssignment(parent) && parent.name === n) return 'code'
    if (ts.isElementAccessExpression(parent) && parent.argumentExpression === n) return 'code'
    if (ts.isCaseClause(parent) && parent.expression === n) return 'code'
    if (
      ts.isJsxExpression(parent) &&
      (ts.isJsxElement(parent.parent) || ts.isJsxFragment(parent.parent))
    )
      return 'child'
    if (ts.isBinaryExpression(parent)) {
      const op = parent.operatorToken.kind
      if (
        op === ts.SyntaxKind.EqualsEqualsEqualsToken ||
        op === ts.SyntaxKind.ExclamationEqualsEqualsToken ||
        op === ts.SyntaxKind.InKeyword
      )
        return 'code'
    }
    if (ts.isJsxAttribute(parent)) {
      const name = parent.name.getText()
      const code = CODE_ATTRS.has(name) || name.startsWith('data-') || name.startsWith('on')
      return code ? 'code' : 'other'
    }
    if (ts.isCallExpression(parent) && CODE_CALLS.has(calleeName(parent))) return 'code'
    if (ts.isNewExpression(parent) && parent.expression.getText() === 'Error') return 'code'
    if (ts.isCallExpression(parent) || ts.isNewExpression(parent) || ts.isBlock(parent))
      return 'other'
  }
  return 'other'
}

const isCopy = (node, text) => {
  const where = position(node)
  if (where === 'child') return /[A-Za-z]/.test(text)
  return where === 'other' && looksLikeWords(text)
}

export const scan = (files) => {
  const found = []
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    const lines = text.split('\n')
    const ignored = (line) =>
      /i18n-ignore/.test(lines[line] ?? '') || /i18n-ignore/.test(lines[line - 1] ?? '')
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const add = (node, value) => {
      const line = source.getLineAndCharacterOfPosition(node.getStart()).line
      if (!ignored(line))
        found.push({ file, line: line + 1, text: value.trim().replace(/\s+/g, ' ') })
    }
    const visit = (node) => {
      if (ts.isJsxText(node)) {
        if (/[A-Za-z]/.test(node.text)) add(node, node.text)
      } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        if (isCopy(node, node.text)) add(node, node.text)
      } else if (ts.isTemplateExpression(node)) {
        const parts = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)]
        if (isCopy(node, parts.join(' ').replace(/\s+/g, ' ')))
          add(node, node.getText().slice(1, -1))
        node.templateSpans.forEach((s) => visit(s.expression))
        return
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  return found
}

const found = scan(ROOTS.flatMap(walk))
const mode = process.argv[2]
if (mode === '--summary') {
  const counts = new Map()
  for (const f of found) counts.set(f.file, (counts.get(f.file) ?? 0) + 1)
  for (const [file, n] of [...counts].sort((a, b) => b[1] - a[1])) console.log(`${n}\t${file}`)
  console.log(`${found.length} strings in ${counts.size} files`)
} else {
  for (const f of found) console.log(`${f.file}:${f.line}\t${f.text}`)
  if (mode === '--check' && found.length > 0) {
    console.error(`\n${found.length} hard-coded UI strings. Move them to src/i18n/messages.ts.`)
    process.exit(1)
  }
}
