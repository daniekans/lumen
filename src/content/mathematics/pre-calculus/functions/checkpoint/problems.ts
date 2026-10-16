import { defineProblems } from '@/lib/practice'
import { problems as evaluateAndDomain } from '../practice-evaluate-and-domain/problems'
import { problems as composeAndInvert } from '../practice-compose-and-invert/problems'
import { problems as transformations } from '../practice-transformations/problems'

const practice = [...evaluateAndDomain, ...composeAndInvert, ...transformations]
const pick = (ids: readonly string[]) => practice.filter((p) => ids.includes(p.id))

/** A relation as TeX: \{(1, 2), (3, 4)\}. */
const relation = (pairs: readonly (readonly [number, number])[]) =>
  `$\\{${pairs.map(([x, y]) => `(${x}, ${y})`).join(', ')}\\}$`

export const problems = defineProblems([
  ...pick([
    'evaluate-piecewise',
    'domain-fraction',
    'range-vertex',
    'compose-formula',
    'inverse-linear',
    'inverse-rational',
    'shift-formula',
    'point-image',
  ]),
  {
    id: 'is-function',
    title: 'Which is a function?',
    skills: ['definition'],
    difficulty: 1,
    generate: (rng) => {
      const xs = rng.shuffle([-3, -2, -1, 0, 1, 2, 3, 4]).slice(0, 4)
      const ys = xs.map(() => rng.int(-5, 5))
      const fn = xs.map((x, i) => [x, ys[i]!] as const)
      // Each distractor gives one input a second, different output.
      const broken = (i: number, j: number) => {
        const pairs = fn.map((p) => [...p] as [number, number])
        pairs[j] = [xs[i]!, ys[i]! + rng.nonZeroInt(-3, 3)]
        return rng.shuffle(pairs)
      }
      const correct = relation(fn)
      const options = rng.shuffle([
        correct,
        relation(broken(0, 1)),
        relation(broken(1, 2)),
        relation(broken(2, 3)),
      ])
      return {
        prompt: 'Which of these relations is a function of $x$? Each pair is $(x, y)$.',
        answer: { kind: 'choice', options, correct: options.indexOf(correct) },
        hints: [
          'A function gives each input exactly one output. Look for an $x$ that appears twice.',
        ],
        solution: [
          `In ${correct} every $x$ appears once, so each input has one output.`,
          'Each of the other relations lists one $x$ with two different $y$ values.',
        ],
      }
    },
  },
  {
    id: 'proof-injective',
    title: 'Short proof',
    skills: ['compose', 'inverse'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'A function is one-to-one when $f(a) = f(b)$ implies $a = b$. Show that if $f$ and $g$ are both one-to-one, then $f \\circ g$ is one-to-one.',
      answer: { kind: 'self' },
      solution: [
        'Suppose $(f \\circ g)(a) = (f \\circ g)(b)$, that is $f(g(a)) = f(g(b))$.',
        '$f$ is one-to-one, so $g(a) = g(b)$.',
        '$g$ is one-to-one, so $a = b$. Therefore $f \\circ g$ is one-to-one.',
      ],
    }),
  },
])
