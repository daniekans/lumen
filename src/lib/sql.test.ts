import { describe, expect, it } from 'vitest'
import { tokenizeSql } from './sql'

const kinds = (sql: string) =>
  tokenizeSql(sql)
    .filter((t) => t.text.trim())
    .map((t) => `${t.kind}:${t.text.trim()}`)

describe('tokenizeSql', () => {
  it('tells keywords, identifiers and literals apart', () => {
    expect(kinds("SELECT SUM(amount) FROM sales WHERE day = 2 AND city = 'OSL'")).toEqual([
      'keyword:SELECT',
      'function:SUM',
      'other:(',
      'identifier:amount',
      'other:)',
      'keyword:FROM',
      'identifier:sales',
      'keyword:WHERE',
      'identifier:day',
      'other:=',
      'number:2',
      'keyword:AND',
      'identifier:city',
      'other:=',
      "string:'OSL'",
    ])
  })

  it('keeps qualified names, quotes inside strings and operators whole', () => {
    expect(kinds("c.id <> o.customer_id OR x = 'it''s' OR y IS NULL")).toEqual([
      'identifier:c.id',
      'other:<>',
      'identifier:o.customer_id',
      'keyword:OR',
      'identifier:x',
      'other:=',
      "string:'it''s'",
      'keyword:OR',
      'identifier:y',
      'keyword:IS',
      'keyword:NULL',
    ])
  })

  it('marks a name before a parenthesis as a function, but not a keyword', () => {
    expect(kinds("WHERE year(day) IN ('PT') AND COUNT (x)")).toEqual([
      'keyword:WHERE',
      'function:year',
      'other:(',
      'identifier:day',
      'other:)',
      'keyword:IN',
      'other:(',
      "string:'PT'",
      'other:)',
      'keyword:AND',
      'identifier:COUNT',
      'other:(',
      'identifier:x',
      'other:)',
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
