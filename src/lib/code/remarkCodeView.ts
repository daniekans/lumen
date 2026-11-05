import { valueToEstree } from 'estree-util-value-to-estree'
import type { Code, Parent, Root, RootContent } from 'mdast'
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
}

const isTabs = (node: Parent) =>
  (node as { type: string }).type === 'mdxJsxFlowElement' &&
  (node as MdxJsxFlowElement).name === 'CodeTabs'

/** Replaces the fences among a parent's children, attaching output fences to the block before. */
const convertChildren = (
  parent: Parent,
  file: VFile,
  pending: Pending[],
  groups = { count: 0 },
) => {
  const group = isTabs(parent) ? groups.count++ : undefined
  const children: RootContent[] = []
  let previous: Pending | undefined
  for (const child of parent.children as RootContent[]) {
    if (child.type !== 'code') {
      if ('children' in child) convertChildren(child as Parent, file, pending, groups)
      children.push(child)
      previous = undefined
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
    previous = { node, snippet, ...(group === undefined ? {} : { group }) }
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
    for (const { node, snippet, group } of pending) {
      const tokens = await tokenize(snippet)
      node.attributes = [
        expressionAttribute('snippet', snippet),
        expressionAttribute('tokens', tokens),
      ] as MdxJsxFlowElement['attributes']
      if (snippet.step) entries.push({ snippet, tokens, ...(group === undefined ? {} : { group }) })
    }
    // An item's code walkthrough also exports the snippets linked to steps, for step peeks.
    if (file.path?.endsWith(CODE_FILE)) tree.children.unshift(snippetsExport(entries))
  }
}
