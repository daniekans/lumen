import { defineProblems } from '@/lib/practice'
import { problems as encoding } from '../practice-encoding-and-compression/problems'
import { problems as layouts } from '../practice-layouts/problems'
import { problems as parquet } from '../practice-parquet/problems'

const practice = [...layouts, ...encoding, ...parquet]
const pick = (ids: readonly string[]) => practice.filter((p) => ids.includes(p.id))

export const problems = defineProblems([
  ...pick([
    'scan-bytes',
    'column-pages',
    'value-offset',
    'dictionary-size',
    'delta-bits',
    'entropy',
    'skip-count',
    'pushdown-bytes',
    'sorted-groups',
  ]),
  {
    id: 'runs-proof',
    title: 'Runs and distinct values',
    skills: ['encoding', 'compression'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'A column holds $n$ values, $d$ of them distinct. Show that it has at least $d$ runs (maximal stretches of equal neighbors), and exactly $d$ when it is sorted.',
      answer: { kind: 'self' },
      hints: [
        'Every run has a single value. For the sorted case, show that two equal values have only equal values between them.',
      ],
      solution: [
        'Every value of the column lies in exactly one run, and all values of a run are equal, so each run carries one value.',
        'Each of the $d$ distinct values occurs somewhere, so it is the value of at least one run. Different values need different runs, so there are at least $d$ runs.',
        'Sorted: if $x_i = x_j$ with $i < j$, then every $x_k$ with $i < k < j$ satisfies $x_i \\leq x_k \\leq x_j = x_i$, so $x_k = x_i$. The rows of one value form one unbroken stretch, which is one maximal run.',
        'So each distinct value has exactly one run, and the sorted column has exactly $d$ runs. This is why sorting before run-length encoding stores $d$ pairs.',
      ],
    }),
  },
])
