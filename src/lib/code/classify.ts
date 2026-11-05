import type { CodeToken, CodeTokenKind } from './snippet.ts'

/*
 * Shiki's tokens to the shared token kinds. Shiki runs at build time with its CSS-variables
 * theme, so each token's color names its kind (`var(--shiki-token-keyword)`). Runs that Shiki
 * leaves in the foreground or marks as punctuation mix names with brackets and commas, so they
 * are split again: identifiers become names (which per-name colors and hover links need) and
 * the rest operators. Joining the text of the result gives back the input.
 */

export interface ShikiLikeToken {
  content: string
  color?: string
}

const IDENT = /[\p{L}_][\p{L}\p{N}_]*/gu

const splitNames = (text: string): CodeToken[] => {
  const out: CodeToken[] = []
  let at = 0
  for (const m of text.matchAll(IDENT)) {
    if (m.index > at) out.push({ kind: 'operator', text: text.slice(at, m.index) })
    out.push({ kind: 'name', text: m[0] })
    at = m.index + m[0].length
  }
  if (at < text.length) out.push({ kind: 'operator', text: text.slice(at) })
  return out
}

const kindOf = (token: ShikiLikeToken): CodeTokenKind | 'split' => {
  const name = /--shiki-token-([\w-]+)/.exec(token.color ?? '')?.[1]
  switch (name) {
    case 'keyword':
      // Shiki marks `=`, `@` and `>` as keywords; the palette mutes operators.
      return /^[\p{L}_]/u.test(token.content.trim()) ? 'keyword' : 'operator'
    case 'function':
      return 'function'
    case 'string':
    case 'string-expression':
    case 'link':
      return 'string'
    case 'constant':
      return 'number'
    case 'comment':
      return 'comment'
    case 'parameter':
      return 'name'
    default:
      return 'split'
  }
}

/** Classifies one line of Shiki tokens, merging neighbors of the same kind (names excepted). */
export const classifyLine = (line: readonly ShikiLikeToken[]): CodeToken[] => {
  const out: CodeToken[] = []
  for (const token of line) {
    const kind = kindOf(token)
    const parts = kind === 'split' ? splitNames(token.content) : [{ kind, text: token.content }]
    for (const part of parts) {
      const last = out.at(-1)
      // Names stay one token each; other runs (and whitespace after them) merge.
      const joins =
        last !== undefined &&
        last.kind !== 'name' &&
        part.kind !== 'name' &&
        (last.kind === part.kind || /^\s+$/.test(part.text))
      if (joins) last.text += part.text
      else out.push({ ...part })
    }
  }
  return out
}
