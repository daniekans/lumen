import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Relational model and joins',
  description:
    'Tables as relations, keys and references, and inner, outer and cross joins as filtered products.',
  order: 1,
  prerequisites: ['mathematics/pre-calculus/functions'],
  skills: [
    {
      id: 'relations',
      title: 'Read a table as a relation: tuples, products, degree and cardinality',
    },
    { id: 'keys', title: 'Identify primary, candidate and foreign keys' },
    { id: 'inner-join', title: 'Compute cross and inner joins' },
    { id: 'outer-join', title: 'Compute left, right, full and anti joins' },
    { id: 'row-counts', title: 'Predict how many rows a join returns' },
  ],
  terms: [
    {
      id: 'attribute-domain',
      title: 'Domain of an attribute',
      summary:
        'The set of values a column can take, such as a set of names $N$. Not the same idea as the domain of a function.',
      introducedIn: 'tables-as-relations',
    },
    {
      id: 'cartesian-product',
      title: 'Cartesian product',
      tex: 'A \\times B',
      summary:
        'The set of all pairs $(a, b)$ with $a \\in A$ and $b \\in B$. Its size is $|A| \\cdot |B|$.',
      introducedIn: 'tables-as-relations',
    },
    {
      id: 'relation',
      title: 'Relation',
      tex: 'R \\subseteq N \\times C',
      summary:
        'Any subset of a Cartesian product of domains. A table is a relation written out: a set of rows, with no order and no duplicates.',
      introducedIn: 'tables-as-relations',
    },
    {
      id: 'tuple',
      title: 'Tuple',
      summary: 'One element of a relation, written as a row of a table.',
      introducedIn: 'tables-as-relations',
    },
    {
      id: 'attribute',
      title: 'Attribute',
      summary: 'A named position in the tuples of a relation, written as a column of a table.',
      introducedIn: 'tables-as-relations',
    },
    {
      id: 'degree',
      title: 'Degree',
      summary: 'The number of attributes (columns) of a relation.',
      introducedIn: 'tables-as-relations',
    },
    {
      id: 'cardinality',
      title: 'Cardinality of a relation',
      tex: '|R|',
      summary:
        'The number of tuples (distinct rows) of a relation, or more generally the size of a set.',
      introducedIn: 'tables-as-relations',
    },
    {
      id: 'key',
      title: 'Key',
      summary:
        'A set of columns on which no two rows agree. It determines every other column, so the table is a function from key values to rows.',
      introducedIn: 'keys-and-references',
    },
    {
      id: 'candidate-key',
      title: 'Candidate key',
      summary: 'Any of the keys a table has. A table can have several.',
      introducedIn: 'keys-and-references',
    },
    {
      id: 'primary-key',
      title: 'Primary key',
      summary:
        'The candidate key chosen to identify rows. SQL also requires its columns to be non-NULL.',
      introducedIn: 'keys-and-references',
    },
    {
      id: 'functional-dependency',
      title: 'Functional dependency',
      tex: 'X \\to Y',
      summary:
        'Rows that agree on the columns $X$ also agree on $Y$, so the table defines a function from values of $X$ to values of $Y$. A key determines every column.',
      introducedIn: 'keys-and-references',
    },
    {
      id: 'foreign-key',
      title: 'Foreign key',
      summary:
        'A column whose values must appear in a key of another table. The references form a many-to-one function from the referencing rows.',
      introducedIn: 'keys-and-references',
    },
    {
      id: 'referential-integrity',
      title: 'Referential integrity',
      summary:
        'Every non-NULL foreign key value matches an existing key. A row that breaks it is an orphan; `ON DELETE` declares how deletes keep the constraint.',
      introducedIn: 'keys-and-references',
    },
    {
      id: 'cross-join',
      title: 'Cross join',
      summary:
        'The Cartesian product of two tables: every row of $A$ paired with every row of $B$, $|A| \\cdot |B|$ rows.',
      introducedIn: 'joins-as-products',
    },
    {
      id: 'inner-join',
      title: 'Inner join',
      tex: 'A \\bowtie_\\theta B',
      summary:
        'The pairs of the product $A \\times B$ for which the condition $\\theta$ is true. Rows with no partner are dropped.',
      introducedIn: 'joins-as-products',
    },
    {
      id: 'theta-join',
      title: 'Theta join',
      summary:
        'A join whose condition is not an equality, such as `c.id < o.customer_id`. It is still a filtered product.',
      introducedIn: 'joins-as-products',
    },
    {
      id: 'null',
      title: 'NULL',
      summary:
        'A missing value. Any comparison with NULL is unknown, not true, so NULL matches nothing in a join, not even another NULL.',
      introducedIn: 'joins-as-products',
    },
    {
      id: 'outer-join',
      title: 'Outer join',
      summary:
        'An inner join plus the rows without a partner, padded with NULLs: left rows for a left join, right rows for a right join, both for a full join.',
      introducedIn: 'outer-joins',
    },
    {
      id: 'anti-join',
      title: 'Anti join',
      summary:
        'The left rows with no match, written as `NOT EXISTS` or as a left join filtered on a NULL right key.',
      introducedIn: 'outer-joins',
    },
    {
      id: 'semi-join',
      title: 'Semi join',
      summary:
        'The left rows with at least one match, each once however many matches it has, written with `EXISTS`.',
      introducedIn: 'outer-joins',
    },
    {
      id: 'equijoin',
      title: 'Equijoin',
      tex: '|A \\bowtie B| = \\sum_k a_k \\, b_k',
      summary:
        'A join on equal values of a column $k$. A value that appears $a_k$ times in $A$ and $b_k$ times in $B$ gives $a_k b_k$ rows.',
      introducedIn: 'join-row-counts',
    },
  ],
})
