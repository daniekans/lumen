import { describe, expect, it } from 'vitest'
import { tokensToSource } from './snippet'
import { tokenizeCode, tokenizePython, tokenizeSql } from './tokenize'
import type { CodeToken } from './snippet'

const kinds = (tokens: readonly CodeToken[]) =>
  tokens.filter((t) => t.text.trim()).map((t) => `${t.kind}:${t.text.trim()}`)

describe('tokenizeSql', () => {
  it('tells keywords, names and literals apart', () => {
    expect(
      kinds(tokenizeSql("SELECT SUM(amount) FROM sales WHERE day = 2 AND city = 'OSL'")),
    ).toEqual([
      'keyword:SELECT',
      'function:SUM',
      'operator:(',
      'name:amount',
      'operator:)',
      'keyword:FROM',
      'name:sales',
      'keyword:WHERE',
      'name:day',
      'operator:=',
      'number:2',
      'keyword:AND',
      'name:city',
      'operator:=',
      "string:'OSL'",
    ])
  })

  it('keeps qualified names, quotes inside strings and operators whole', () => {
    expect(kinds(tokenizeSql("c.id <> o.customer_id OR x = 'it''s' OR y IS NULL"))).toEqual([
      'name:c.id',
      'operator:<>',
      'name:o.customer_id',
      'keyword:OR',
      'name:x',
      'operator:=',
      "string:'it''s'",
      'keyword:OR',
      'name:y',
      'keyword:IS',
      'keyword:NULL',
    ])
  })

  it('marks a name before a parenthesis as a function, but not a keyword', () => {
    expect(kinds(tokenizeSql("WHERE year(day) IN ('PT') AND COUNT (x)"))).toEqual([
      'keyword:WHERE',
      'function:year',
      'operator:(',
      'name:day',
      'operator:)',
      'keyword:IN',
      'operator:(',
      "string:'PT'",
      'operator:)',
      'keyword:AND',
      'name:COUNT',
      'operator:(',
      'name:x',
      'operator:)',
    ])
  })

  it('reads comments to the end of the line', () => {
    expect(kinds(tokenizeSql('SELECT 1 -- one\nFROM t'))).toEqual([
      'keyword:SELECT',
      'number:1',
      'comment:-- one',
      'keyword:FROM',
      'name:t',
    ])
  })

  it('gives back the input', () => {
    const sql = "INSERT INTO sales VALUES (9, 'Thu', 'OSL', 23.5) -- done"
    expect(
      tokenizeSql(sql)
        .map((t) => t.text)
        .join(''),
    ).toBe(sql)
  })
})

describe('tokenizePython', () => {
  it('splits dotted names and marks calls', () => {
    expect(kinds(tokenizePython('w = np.linalg.norm(A @ v) * 2.5e-3'))).toEqual([
      'name:w',
      'operator:=',
      'name:np',
      'operator:.',
      'name:linalg',
      'operator:.',
      'function:norm',
      'operator:(',
      'name:A',
      'operator:@',
      'name:v',
      'operator:) *',
      'number:2.5e-3',
    ])
  })

  it('reads definitions, type hints, keywords and comments', () => {
    expect(
      kinds(tokenizePython('def apply(A: Matrix, v) -> None:  # map v\n    return A @ v')),
    ).toEqual([
      'keyword:def',
      'function:apply',
      'operator:(',
      'name:A',
      'operator::',
      'name:Matrix',
      'operator:,',
      'name:v',
      'operator:) ->',
      'keyword:None',
      'operator::',
      'comment:# map v',
      'keyword:return',
      'name:A',
      'operator:@',
      'name:v',
    ])
  })

  it('reads prefixed, escaped and triple-quoted strings', () => {
    expect(kinds(tokenizePython(`f"{x!r}" + 'it\\'s' + """a\n'b'""" + rb'\\d'`))).toEqual([
      'string:f"{x!r}"',
      'operator:+',
      "string:'it\\'s'",
      'operator:+',
      `string:"""a\n'b'"""`,
      'operator:+',
      "string:rb'\\d'",
    ])
  })

  it('keeps names that end in digits and numbers with underscores apart', () => {
    expect(kinds(tokenizePython('x2 = 1_000 + .5j + x_hat[0]'))).toEqual([
      'name:x2',
      'operator:=',
      'number:1_000',
      'operator:+',
      'number:.5j',
      'operator:+',
      'name:x_hat',
      'operator:[',
      'number:0',
      'operator:]',
    ])
  })
})

describe('tokenizeCode', () => {
  const sources = {
    python:
      'import numpy as np\n\n\ndef f(x: float) -> float:\n    """Doc\n    string."""\n    return x ** 2  # square\n',
    sql: "SELECT a\n  FROM t -- all\n WHERE b = 'x\ny'",
    text: 'plain\n\ntext',
  } as const

  it.each(Object.entries(sources))('gives back the %s input, one list per line', (lang, source) => {
    const tokens = tokenizeCode(lang as keyof typeof sources, source)
    expect(tokensToSource(tokens)).toBe(source)
    expect(tokens).toHaveLength(source.split('\n').length)
    expect(tokens.flat().every((t) => t.text && !t.text.includes('\n'))).toBe(true)
  })

  it('splits a multi-line string into one string token per line', () => {
    const tokens = tokenizeCode('python', 's = """a\nb"""')
    expect(tokens[1]).toEqual([{ kind: 'string', text: 'b"""' }])
  })
})
