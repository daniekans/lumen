import type { CodeLang, CodeToken, CodeTokenKind, CodeTokens } from './snippet.ts'
import { plainTokens } from './snippet.ts'

/*
 * In-house tokenizers for code drawn on a stage, where Shiki's runtime would cost hundreds of kB
 * for a few lines. They return the shared token kinds of the build-time path (`classify.ts`), so
 * a snippet looks the same in the pane and on the stage. They highlight, they do not parse.
 * Joining the tokens' text gives back the input.
 */

/** Appends a token, merging operators (and spaces) into their neighbor so lines stay short. */
const push = (out: CodeToken[], kind: CodeTokenKind, text: string) => {
  const last = out.at(-1)
  if (kind === 'operator' && last?.kind === 'operator') last.text += text
  else out.push({ kind, text })
}

/** Splits one token list at its newlines into one list per line. */
const toLines = (tokens: readonly CodeToken[]): CodeTokens => {
  const lines: CodeToken[][] = [[]]
  for (const token of tokens) {
    token.text.split('\n').forEach((part, k) => {
      if (k > 0) lines.push([])
      if (part) lines.at(-1)!.push({ kind: token.kind, text: part })
    })
  }
  return lines
}

const SQL_KEYWORDS = new Set(
  (
    'ALL AND AS ASC BETWEEN BY CASE CROSS DESC DISTINCT DISTRIBUTE ELSE END EXISTS FROM FULL ' +
    'GROUP HAVING IN INNER INSERT INTO IS JOIN LEFT LIKE LIMIT NOT NULL ON OR ORDER OUTER OVER ' +
    'PARTITION RIGHT SELECT THEN UNION VALUES WHEN WHERE WITH'
  ).split(' '),
)

const SQL_TOKEN = /--[^\n]*|'(?:[^']|'')*'?|\d+(?:\.\d+)?(?!\w)|[A-Za-z_][\w.]*|\s+|./gy

/**
 * SQL tokens of one line or several: keywords, function names (a name before an opening
 * parenthesis), string and number literals, `--` comments, names (qualified names such as
 * `c.id` stay whole) and operators.
 */
export const tokenizeSql = (sql: string): CodeToken[] => {
  const out: CodeToken[] = []
  SQL_TOKEN.lastIndex = 0
  for (let m = SQL_TOKEN.exec(sql); m; m = SQL_TOKEN.exec(sql)) {
    const text = m[0]
    const kind: CodeTokenKind = text.startsWith('--')
      ? 'comment'
      : text.startsWith("'")
        ? 'string'
        : /^\d/.test(text)
          ? 'number'
          : /^[A-Za-z_]/.test(text)
            ? SQL_KEYWORDS.has(text.toUpperCase())
              ? 'keyword'
              : sql[SQL_TOKEN.lastIndex] === '('
                ? 'function'
                : 'name'
            : 'operator'
    push(out, kind, text)
  }
  return out
}

const PY_KEYWORDS = new Set(
  (
    'False None True and as assert async await break class continue def del elif else except ' +
    'finally for from global if import in is lambda nonlocal not or pass raise return try ' +
    'while with yield'
  ).split(' '),
)

/*
 * Order matters: comments, then strings (triple-quoted first, with an optional prefix such as
 * `f` or `rb`), numbers (with `_`, exponents and the imaginary `j`), names, spaces, the rest.
 */
const PY_TOKEN =
  /#[^\n]*|(?:[rRbBfFuU]{1,2})?(?:'''[\s\S]*?(?:'''|$)|"""[\s\S]*?(?:"""|$)|'(?:\\.|[^'\\\n])*'?|"(?:\\.|[^"\\\n])*"?)|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?[jJ]?(?![\p{L}\p{N}_])|[\p{L}_][\p{L}\p{N}_]*|\s+|./uy

/**
 * Python tokens: keywords (with `True`, `False`, `None`), calls and defined names as functions,
 * string literals (prefixes and triple quotes included), numbers, comments, names and operators.
 * Dotted names split at the dots, so `np` and `linalg` in `np.linalg.norm(v)` are names of
 * their own (per-name colors and hover links need that).
 */
export const tokenizePython = (source: string): CodeToken[] => {
  const out: CodeToken[] = []
  PY_TOKEN.lastIndex = 0
  let defining = false
  for (let m = PY_TOKEN.exec(source); m; m = PY_TOKEN.exec(source)) {
    const text = m[0]
    let kind: CodeTokenKind
    if (text.startsWith('#')) kind = 'comment'
    else if (/^[rRbBfFuU]{0,2}['"]/.test(text)) kind = 'string'
    else if (/^\.?\d/.test(text)) kind = 'number'
    else if (/^[\p{L}_]/u.test(text)) {
      if (PY_KEYWORDS.has(text)) kind = 'keyword'
      else if (defining || /^\s*\(/.test(source.slice(PY_TOKEN.lastIndex))) kind = 'function'
      else kind = 'name'
      defining = text === 'def' || text === 'class'
      push(out, kind, text)
      continue
    } else kind = 'operator'
    if (!/^\s+$/.test(text)) defining = false
    push(out, kind, text)
  }
  return out
}

/** Tokens per line for any language: the in-house tokenizers, or plain text for the rest. */
export const tokenizeCode = (lang: CodeLang, source: string): CodeTokens => {
  switch (lang) {
    case 'python':
      return toLines(tokenizePython(source))
    case 'sql':
      return toLines(tokenizeSql(source))
    default:
      return plainTokens(source)
  }
}
