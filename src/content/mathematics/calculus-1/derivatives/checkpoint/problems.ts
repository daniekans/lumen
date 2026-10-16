import { defineProblems } from '@/lib/practice'
import { problems as practice } from '../difference-quotients/problems'

const pick = (ids: readonly string[]) => practice.filter((p) => ids.includes(p.id))

export const problems = defineProblems([
  ...pick([
    'secant-slope',
    'difference-quotient',
    'derivative-at-point',
    'derivative-function',
    'tangent-line',
  ]),
  {
    id: 'proof-square',
    title: 'Short proof',
    skills: ['definition'],
    difficulty: 3,
    generate: () => ({
      prompt:
        "Using only the limit definition, show that the derivative of $f(x) = x^2$ is $f'(x) = 2x$.",
      answer: { kind: 'self' },
      solution: [
        '$f(x + h) - f(x) = (x + h)^2 - x^2 = 2xh + h^2$.',
        'For $h \\neq 0$: $\\dfrac{f(x + h) - f(x)}{h} = 2x + h$.',
        "$f'(x) = \\lim_{h \\to 0} (2x + h) = 2x$.",
      ],
    }),
  },
])
