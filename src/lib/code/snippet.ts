/*
 * The code model: a snippet is data first, rendering second. The exact source is always kept
 * next to its tokens, so a renderer, a checker or a future runner can read it back. Pure and
 * shared by the build (the remark plugin) and every renderer (`CodeView`, later `CodeBlock`).
 */

/** Languages highlighted at build time. Anything else is shown as plain text. */
export const CODE_LANGS = [
  'python',
  'sql',
  'scala',
  'typescript',
  'bash',
  'json',
  'yaml',
  'text',
] as const

export type CodeLang = (typeof CODE_LANGS)[number]

export const isCodeLang = (lang: string): lang is CodeLang =>
  (CODE_LANGS as readonly string[]).includes(lang)

/**
 * Palette hues a name in the code may take, so `A` in the code matches `A` on the stage. Names
 * of `vc` in `src/styles/viz-colors.ts` (this module stays free of styles).
 */
export const CODE_HUES = ['blue', 'yellow', 'teal', 'red', 'green', 'purple', 'orange'] as const

export type CodeHue = (typeof CODE_HUES)[number]

/** The token kinds of the shared code palette (`--code-<kind>` in `tokens.css`). */
export type CodeTokenKind =
  'keyword' | 'function' | 'string' | 'number' | 'comment' | 'name' | 'operator'

export interface CodeToken {
  kind: CodeTokenKind
  text: string
}

/** One token list per line of the source. */
export type CodeTokens = readonly (readonly CodeToken[])[]

export interface CodeSnippet {
  lang: CodeLang
  /** The exact code, always kept. */
  source: string
  /** A file name or caption shown above the code. */
  title?: string
  /** The label of this snippet's tab inside `CodeTabs` (falls back to the title). */
  tab?: string
  /** The id of the step this snippet explains. */
  step?: string
  /** Highlighted lines, 1-based. */
  highlight?: readonly number[]
  /** Names drawn in a stage color, such as `{ A: 'blue' }`. */
  colors?: Readonly<Record<string, CodeHue>>
  /** Names linked to a shape's `hoverKey`, such as `{ A: 'matrix' }`. */
  hoverKeys?: Readonly<Record<string, string>>
  /** Printed output, shown after the code. */
  output?: string
  /** Opt-in snippet check in CI (batch 5); `env` names the environment. */
  check?: { env: string }
}

/** Joins the tokens back into the source (the inverse of tokenizing). */
export const tokensToSource = (tokens: CodeTokens) =>
  tokens.map((line) => line.map((t) => t.text).join('')).join('\n')

/** Plain-text tokens (one per line, in the foreground color), for `text` blocks. */
export const plainTokens = (source: string): CodeTokens =>
  source.split('\n').map((line) => (line ? [{ kind: 'name' as const, text: line }] : []))
