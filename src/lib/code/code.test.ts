import { describe, expect, it } from 'vitest'
import { classifyLine } from './classify'
import { parseFence, parseLineRanges } from './fence'
import type { Root, RootContent } from 'mdast'
import type { VFile } from 'vfile'
import { remarkCodeView, tokenize } from './remarkCodeView'
import { plainTokens, tokensToSource } from './snippet'

describe('parseFence', () => {
  it('reads every option', () => {
    const info = parseFence(
      'py',
      'title="rotate.py" {1,3-4} step=shear colors="A=blue v=orange" hover="A=matrix" check',
    )
    expect(info).toEqual({
      kind: 'code',
      snippet: {
        lang: 'python',
        title: 'rotate.py',
        highlight: [1, 3, 4],
        step: 'shear',
        colors: { A: 'blue', v: 'orange' },
        hoverKeys: { A: 'matrix' },
        check: true,
      },
    })
  })

  it('defaults to text and names the check environment', () => {
    expect(parseFence(null, 'check=torch tab=PyTorch')).toEqual({
      kind: 'code',
      snippet: { lang: 'text', check: true, env: 'torch', tab: 'PyTorch' },
    })
    expect(parseFence('python', 'env=spark raises=ValueError')).toEqual({
      kind: 'code',
      snippet: { lang: 'python', env: 'spark', raises: 'ValueError' },
    })
  })

  it('recognizes output blocks', () => {
    expect(parseFence('output', null)).toEqual({ kind: 'output', excerpt: false })
    expect(parseFence('text', 'output')).toEqual({ kind: 'output', excerpt: false })
    expect(parseFence('output', 'excerpt')).toEqual({ kind: 'output', excerpt: true })
  })

  it('reports mistakes', () => {
    for (const [lang, meta] of [
      ['cobol', ''],
      ['python', 'colors="A=pink"'],
      ['python', 'colors="A"'],
      ['python', '{4-2}'],
      ['python', 'titel="x"'],
      ['python', 'step'],
      ['python', 'env'],
      ['python', 'env=cuda'],
      ['python', 'env=spark check=torch'],
      ['python', 'raises'],
    ] as const) {
      expect(parseFence(lang, meta).kind).toBe('error')
    }
  })
})

describe('parseLineRanges', () => {
  it('expands, sorts and removes duplicates', () => {
    expect(parseLineRanges('5, 2-3,3')).toEqual([2, 3, 5])
    expect(parseLineRanges('0')).toBeUndefined()
    expect(parseLineRanges('a')).toBeUndefined()
  })
})

describe('classifyLine', () => {
  it('splits names out of foreground runs and mutes operators', () => {
    const line = classifyLine([
      { content: '    x_hat ', color: 'var(--shiki-foreground)' },
      { content: '=', color: 'var(--shiki-token-keyword)' },
      { content: ' A ', color: 'var(--shiki-foreground)' },
      { content: '@', color: 'var(--shiki-token-keyword)' },
      { content: ' np', color: 'var(--shiki-foreground)' },
      { content: '.', color: 'var(--shiki-token-punctuation)' },
      { content: 'sum', color: 'var(--shiki-token-function)' },
      { content: '(v, axis', color: 'var(--shiki-token-punctuation)' },
      { content: '=', color: 'var(--shiki-token-keyword)' },
      { content: '0', color: 'var(--shiki-token-constant)' },
      { content: ')  ', color: 'var(--shiki-token-punctuation)' },
      { content: '# done', color: 'var(--shiki-token-comment)' },
    ])
    expect(line).toEqual([
      { kind: 'operator', text: '    ' },
      { kind: 'name', text: 'x_hat' },
      { kind: 'operator', text: ' = ' },
      { kind: 'name', text: 'A' },
      { kind: 'operator', text: ' @ ' },
      { kind: 'name', text: 'np' },
      { kind: 'operator', text: '.' },
      { kind: 'function', text: 'sum' },
      { kind: 'operator', text: '(' },
      { kind: 'name', text: 'v' },
      { kind: 'operator', text: ', ' },
      { kind: 'name', text: 'axis' },
      { kind: 'operator', text: '=' },
      { kind: 'number', text: '0' },
      { kind: 'operator', text: ')  ' },
      { kind: 'comment', text: '# done' },
    ])
  })

  it('keeps word keywords as keywords', () => {
    expect(classifyLine([{ content: 'return', color: 'var(--shiki-token-keyword)' }])).toEqual([
      { kind: 'keyword', text: 'return' },
    ])
  })
})

describe('tokenizing with Shiki', () => {
  const samples = {
    python:
      'import numpy as np\n\ndef f(A: np.ndarray, v: np.ndarray) -> np.ndarray:\n    return A @ v  # "x"\n',
    sql: "SELECT c.*, SUM(x)\nFROM t\nWHERE s = 'a''b' AND n > 3 -- note",
    scala: 'val df = spark.read.parquet("p")\ndf.repartition($"key")',
    bash: 'pip install numpy==2.1 # pin',
    text: 'plain\n\ntext',
  } as const

  it('gives back the exact source', async () => {
    for (const [lang, source] of Object.entries(samples)) {
      const tokens = await tokenize({ lang: lang as keyof typeof samples, source })
      expect(tokensToSource(tokens)).toBe(source)
    }
  })

  it('finds the kinds of a Python line', async () => {
    const [, , def] = await tokenize({ lang: 'python', source: samples.python })
    const kinds = Object.fromEntries(def!.map((t) => [t.text.trim(), t.kind]))
    expect(kinds).toMatchObject({ def: 'keyword', f: 'function', A: 'name', np: 'name' })
  })

  it('keeps plain text as it is', () => {
    expect(tokensToSource(plainTokens('a\n\nb'))).toBe('a\n\nb')
  })
})

describe('remarkCodeView', () => {
  const fence = (meta: string | null, value = 'x = 1') => ({
    type: 'code' as const,
    lang: 'python',
    meta,
    value,
  })
  const tree = (): Root => ({
    type: 'root',
    children: [
      fence('step=a'),
      fence(null),
      {
        type: 'mdxJsxFlowElement',
        name: 'CodeTabs',
        attributes: [],
        children: [fence('step=b tab=NumPy'), fence('step=b tab=PyTorch')],
      },
    ],
  })
  const run = async (path: string) => {
    const t = tree()
    const file = {
      path,
      fail: (m: string) => {
        throw new Error(m)
      },
    } as unknown as VFile
    await remarkCodeView()(t, file)
    return t
  }
  const exported = (t: Root) => {
    const esm = t.children[0] as unknown as { type: string; data: { estree: unknown } }
    return esm.type === 'mdxjsEsm' ? JSON.stringify(esm.data.estree) : undefined
  }

  it('exports the step snippets of a code walkthrough, with their tabs group', async () => {
    const json = exported(await run('/c/a/u/i/code.mdx'))!
    expect(json).toContain('"name":"snippets"')
    // Three step blocks: one alone, two in the first CodeTabs (group 0). The block without a
    // step is left out.
    const count = (value: string) => json.split(`"value":"${value}"`).length - 1
    expect(count('step')).toBe(3)
    expect([count('a'), count('b')]).toEqual([1, 2])
    expect(count('group')).toBe(2)
  })

  it('gives a block the paragraph before it as its lead, and a CodeTabs its tabs', async () => {
    const para = (...children: unknown[]) => ({ type: 'paragraph', children }) as RootContent
    const t: Root = {
      type: 'root',
      children: [
        para(
          { type: 'text', value: 'Weigh the\ncolumns of ' },
          { type: 'inlineCode', value: 'A' },
          { type: 'text', value: ' by ' },
          { type: 'inlineMath', value: 'x_1' },
          { type: 'emphasis', children: [{ type: 'text', value: ' now' }] },
        ),
        fence('step=a'),
        fence('step=c'),
        para({ type: 'text', value: 'Two libraries.' }),
        {
          type: 'mdxJsxFlowElement',
          name: 'CodeTabs',
          attributes: [],
          children: [fence('step=b tab=NumPy'), fence('step=b tab=PyTorch')],
        },
      ],
    }
    const file = { path: '/c/a/u/i/code.mdx', fail: () => {} } as unknown as VFile
    await remarkCodeView()(t, file)
    const json = exported(t)!
    const count = (value: string) => json.split(`"value":"${value}"`).length - 1
    expect(count('Weigh the columns of `A` by $x_1$ now')).toBe(1)
    expect(count('Two libraries.')).toBe(2)
    expect(count('lead')).toBe(3)
  })

  it('exports nothing from an explanation', async () => {
    expect(exported(await run('/c/a/u/i/explanation.mdx'))).toBeUndefined()
  })
})
