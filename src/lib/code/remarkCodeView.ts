import { valueToEstree } from 'estree-util-value-to-estree'
import type { Code, Paragraph, Parent, PhrasingContent, Root, RootContent } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import { createCssVariablesTheme, createHighlighter, type Highlighter } from 'shiki'
import type { VFile } from 'vfile'
import { classifyLine } from './classify.ts'
import { parseFence } from './fence.ts'
import {
  CODE_FILE,
  CODE_LANGS,
  type CodeEntry,
  type CodeSnippet,
  type CodeTokens,
  plainTokens,
} from './snippet.ts'

/*
 * A remark plugin (build time only) that turns every fenced block in MDX into
 * `<CodeView snippet={...} tokens={...} />`: the snippet keeps the exact source, and the tokens
 * come from Shiki, classified into the shared token kinds. No highlighter reaches the browser,
 * and nothing is flattened into HTML that a checker or runner could not read back.
 */

const theme = createCssVariablesTheme({ name: 'lumen-code', variablePrefix: '--shiki-' })

let highlighter: Promise<Highlighter> | undefined
const getHighlighter = () =>
  (highlighter ??= createHighlighter({
    themes: [theme],
    langs: CODE_LANGS.filter((l) => l !== 'text'),
  }))

/** The tokens of a snippet: Shiki's for known languages, plain lines for `text`. */
export const tokenize = async (snippet: CodeSnippet): Promise<CodeTokens> => {
  if (snippet.lang === 'text') return plainTokens(snippet.source)
  const h = await getHighlighter()
  const { tokens } = h.codeToTokens(snippet.source, { lang: snippet.lang, theme: 'lumen-code' })
  return tokens.map(classifyLine)
}

const expressionAttribute = (name: string, value: unknown) => ({
  type: 'mdxJsxAttribute' as const,
  name,
  value: {
    type: 'mdxJsxAttributeValueExpression' as const,
    value: '',
    data: {
      estree: {
        type: 'Program' as const,
        sourceType: 'module' as const,
        body: [{ type: 'ExpressionStatement' as const, expression: valueToEstree(value) }],
      },
    },
  },
})

interface Pending {
  node: MdxJsxFlowElement
  snippet: CodeSnippet
  /** The `CodeTabs` the block sits in, numbered in order. */
  group?: number
  lead?: string
}

/**
 * A paragraph as one line of text for `RichText`: inline code keeps its backticks and math its
 * dollars; emphasis, links and term tags keep only their text.
 */
const inlineText = (nodes: readonly PhrasingContent[]): string =>
  nodes
    .map((n) => {
      const node = n as { type: string; value?: string; children?: PhrasingContent[] }
      if (node.type === 'inlineCode') return '`' + node.value + '`'
      if (node.type === 'inlineMath') return '$' + node.value + '$'
      if (node.type === 'break') return ' '
      if (node.children) return inlineText(node.children)
      return node.value ?? ''
    })
    .join('')

const leadOf = (node: RootContent | undefined) =>
  node?.type === 'paragraph'
    ? inlineText((node as Paragraph).children)
        .replace(/\s+/g, ' ')
        .trim()
    : undefined

const isTabs = (node: Parent) =>
  (node as { type: string }).type === 'mdxJsxFlowElement' &&
  (node as MdxJsxFlowElement).name === 'CodeTabs'

/** Replaces the fences among a parent's children, attaching output fences to the block before. */
const convertChildren = (
  parent: Parent,
  file: VFile,
  pending: Pending[],
  groups = { count: 0 },
  parentLead?: string,
) => {
  const group = isTabs(parent) ? groups.count++ : undefined
  const children: RootContent[] = []
  let previous: Pending | undefined
  // The node before the current one, for leads (output fences are skipped, not counted).
  let before: RootContent | undefined
  for (const child of parent.children as RootContent[]) {
    if (child.type !== 'code') {
      if ('children' in child) {
        const lead = isTabs(child as Parent) ? leadOf(before) : undefined
        convertChildren(child as Parent, file, pending, groups, lead)
      }
      children.push(child)
      previous = undefined
      before = child
      continue
    }
    const code = child as Code
    const fence = parseFence(code.lang, code.meta)
    if (fence.kind === 'error') file.fail(`Code fence: ${fence.message}`, code)
    if (fence.kind === 'output') {
      if (!previous) file.fail('Code fence: an output block must follow a code block', code)
      previous.snippet.output = code.value
      continue
    }
    const snippet: CodeSnippet = { ...fence.snippet, source: code.value }
    const node: MdxJsxFlowElement = {
      type: 'mdxJsxFlowElement',
      name: 'CodeView',
      attributes: [],
      children: [],
      position: code.position,
    }
    const lead = group === undefined ? leadOf(before) : parentLead
    previous = {
      node,
      snippet,
      ...(group === undefined ? {} : { group }),
      ...(lead ? { lead } : {}),
    }
    before = child
    pending.push(previous)
    children.push(node)
  }
  parent.children = children
}

/** `export const snippets = [...]`, as an MDX ESM node. */
const snippetsExport = (entries: readonly CodeEntry[]) =>
  ({
    type: 'mdxjsEsm',
    value: '',
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ExportNamedDeclaration',
            specifiers: [],
            source: null,
            declaration: {
              type: 'VariableDeclaration',
              kind: 'const',
              declarations: [
                {
                  type: 'VariableDeclarator',
                  id: { type: 'Identifier', name: 'snippets' },
                  init: valueToEstree(entries),
                },
              ],
            },
          },
        ],
      },
    },
  }) as unknown as RootContent

export function remarkCodeView() {
  return async (tree: Root, file: VFile) => {
    const pending: Pending[] = []
    convertChildren(tree, file, pending)
    const entries: CodeEntry[] = []
    for (const { node, snippet, group, lead } of pending) {
      const tokens = await tokenize(snippet)
      node.attributes = [
        expressionAttribute('snippet', snippet),
        expressionAttribute('tokens', tokens),
      ] as MdxJsxFlowElement['attributes']
      if (snippet.steps)
        entries.push({
          snippet,
          tokens,
          ...(group === undefined ? {} : { group }),
          ...(lead ? { lead } : {}),
        })
    }
    // An item's code walkthrough also exports the snippets linked to steps, for the code panel.
    if (file.path?.endsWith(CODE_FILE)) tree.children.unshift(snippetsExport(entries))
  }
}
