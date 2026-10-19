/*
 * A small SQL tokenizer for highlighting the one-line queries in visualizations. It knows
 * keywords, function names (a name followed by an opening parenthesis), string and number
 * literals, identifiers and the rest (operators, punctuation, spaces); it does not parse.
 * Joining the tokens' text gives back the input.
 */

export type SqlTokenKind = 'keyword' | 'function' | 'string' | 'number' | 'identifier' | 'other'

export interface SqlToken {
  kind: SqlTokenKind
  text: string
}

const KEYWORDS = new Set([
  'AND',
  'AS',
  'ASC',
  'BETWEEN',
  'BY',
  'CROSS',
  'DESC',
  'DISTINCT',
  'FROM',
  'FULL',
  'GROUP',
  'HAVING',
  'IN',
  'INNER',
  'INSERT',
  'INTO',
  'IS',
  'JOIN',
  'LEFT',
  'LIKE',
  'LIMIT',
  'NOT',
  'NULL',
  'ON',
  'OR',
  'ORDER',
  'OUTER',
  'RIGHT',
  'SELECT',
  'VALUES',
  'WHERE',
])

const TOKEN = /'(?:[^']|'')*'?|\d+(?:\.\d+)?(?![\w])|[A-Za-z_][\w.]*|\s+|./gy

export const tokenizeSql = (sql: string): SqlToken[] => {
  const tokens: SqlToken[] = []
  TOKEN.lastIndex = 0
  for (let m = TOKEN.exec(sql); m; m = TOKEN.exec(sql)) {
    const text = m[0]
    const kind: SqlTokenKind = text.startsWith("'")
      ? 'string'
      : /^\d/.test(text)
        ? 'number'
        : /^[A-Za-z_]/.test(text)
          ? KEYWORDS.has(text.toUpperCase())
            ? 'keyword'
            : sql[TOKEN.lastIndex] === '('
              ? 'function'
              : 'identifier'
          : 'other'
    const last = tokens.at(-1)
    if (kind === 'other' && last?.kind === 'other') last.text += text
    else tokens.push({ kind, text })
  }
  return tokens
}
