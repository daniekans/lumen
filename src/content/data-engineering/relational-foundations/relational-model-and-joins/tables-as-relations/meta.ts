import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Tables as relations',
  summary:
    'A table is a relation: a set of tuples chosen from the Cartesian product of its column domains. Row order carries no meaning, and when one column determines another the relation is a function.',
  tags: ['relation', 'table', 'tuple', 'Cartesian product', 'domain', 'key', 'function'],
  level: 'intro',
  order: 1,
  skills: ['relations'],
  steps: [
    {
      id: 'domains',
      title: 'Two domains',
      caption:
        'Each column draws its values from a set, its domain. Here $N$ holds four names and $C$ holds three cities.',
    },
    {
      id: 'product',
      title: 'The Cartesian product',
      caption:
        'The product $N \\times C$ is the set of every pair (name, city). With $4$ names and $3$ cities it has $4 \\cdot 3 = 12$ pairs, one per cell of the grid.',
    },
    {
      id: 'relation',
      title: 'A relation is a subset',
      caption:
        'A relation $R \\subseteq N \\times C$ picks the pairs that are true, here "lives in". Click cells to add or remove pairs.',
    },
    {
      id: 'table',
      title: 'Write the subset as a table',
      caption:
        'Each chosen pair becomes a row, called a tuple. The columns are the attributes. The degree is the number of columns ($2$) and the cardinality is the number of rows.',
    },
    {
      id: 'order',
      title: 'Order carries no meaning',
      caption:
        'A set has no order, so shuffling the rows gives the same relation. A query that needs an order has to ask for one with ORDER BY.',
    },
    {
      id: 'function',
      title: 'When a column determines another',
      caption:
        'If every name appears in exactly one row, the relation is a function from names to cities and name is a key. Ana with a second city breaks it, like an input with two outputs.',
    },
  ],
})
