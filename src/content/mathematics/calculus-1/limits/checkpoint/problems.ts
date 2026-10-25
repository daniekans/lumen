import { defineProblems } from '@/lib/practice'
import { problems as squeeze } from '../practice-continuity-and-squeeze/problems'
import { problems as evaluating } from '../practice-evaluating-limits/problems'
import { problems as definition } from '../practice-limit-definition/problems'

const pick = (ids: readonly string[]) =>
  ids.map((id) => [...evaluating, ...squeeze, ...definition].find((p) => p.id === id)!)

export const problems = defineProblems([
  ...pick([
    'factor-cancel',
    'rationalize',
    'two-sided-exists',
    'infinite-limit',
    'limit-at-infinity',
    'piecewise-parameter',
    'classify-rational',
    'sin-limit',
    'ivt-interval',
    'growth-ratio',
    'delta-min-rule',
    'conjugate-at-infinity',
    'two-techniques',
  ]),
  {
    id: 'proof-constant-multiple',
    title: 'Prove a limit law',
    skills: ['limit-definition'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'Let $c \\neq 0$ and suppose $\\lim_{x \\to a} f(x) = L$. Prove from the definition that $\\lim_{x \\to a} c f(x) = cL$.',
      answer: { kind: 'self' },
      hints: [
        '$|c f(x) - cL| = |c|\\,|f(x) - L|$.',
        'The hypothesis holds for every tolerance, so use it with $\\frac{\\varepsilon}{|c|}$.',
      ],
      solution: [
        'Scratch work: $|c f(x) - cL| = |c|\\,|f(x) - L|$, which is less than $\\varepsilon$ when $|f(x) - L| < \\frac{\\varepsilon}{|c|}$.',
        'Proof: let $\\varepsilon > 0$. Since $\\frac{\\varepsilon}{|c|} > 0$ and $f \\to L$, there is a $\\delta > 0$ such that $0 < |x - a| < \\delta$ gives $|f(x) - L| < \\frac{\\varepsilon}{|c|}$.',
        'For those $x$, $|c f(x) - cL| = |c|\\,|f(x) - L| < |c| \\cdot \\frac{\\varepsilon}{|c|} = \\varepsilon$.',
        'So the same $\\delta$ works for $cf$, and $\\lim_{x \\to a} c f(x) = cL$. (For $c = 0$ the statement holds trivially: $cf$ is the constant $0$.)',
      ],
    }),
  },
])
