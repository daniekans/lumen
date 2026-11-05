import { describe, expect, it } from 'vitest'
import { classifyLine } from './classify'
import { parseFence, parseLineRanges } from './fence'
import { tokenize } from './remarkCodeView'
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
        check: { env: 'default' },
      },
    })
  })

  it('defaults to text and names the check environment', () => {
    expect(parseFence(null, 'check=torch tab=PyTorch')).toEqual({
      kind: 'code',
      snippet: { lang: 'text', check: { env: 'torch' }, tab: 'PyTorch' },
    })
  })

  it('recognizes output blocks', () => {
    expect(parseFence('output', null)).toEqual({ kind: 'output' })
    expect(parseFence('text', 'output')).toEqual({ kind: 'output' })
  })

  it('reports mistakes', () => {
    for (const [lang, meta] of [
      ['cobol', ''],
      ['python', 'colors="A=pink"'],
      ['python', 'colors="A"'],
      ['python', '{4-2}'],
      ['python', 'titel="x"'],
      ['python', 'step'],
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
