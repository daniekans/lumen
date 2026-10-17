import { defineProblems } from '@/lib/practice'
import { problems as practice } from '../practice-polynomial-and-rational/problems'

const pick = (ids: readonly string[]) => practice.filter((p) => ids.includes(p.id))

export const problems = defineProblems([
  ...pick([
    'line-through-points',
    'vertex-form',
    'quadratic-extreme',
    'end-behavior',
    'touching-zero',
    'vertical-asymptotes',
    'hole',
    'horizontal-asymptote',
    'slant-asymptote',
  ]),
  {
    id: 'proof-vertex',
    title: 'Short proof',
    skills: ['quadratics'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'Show that for $a \\neq 0$ the parabola $y = ax^2 + bx + c$ has its vertex at $x = -\\frac{b}{2a}$, and that it has two real zeros exactly when $b^2 - 4ac > 0$.',
      answer: { kind: 'self' },
      hints: [
        'Factor $a$ out of the first two terms and complete the square inside the parentheses.',
      ],
      solution: [
        'Factor $a$ out of the first two terms: $ax^2 + bx + c = a\\left(x^2 + \\frac{b}{a}x\\right) + c$.',
        'Complete the square: $x^2 + \\frac{b}{a}x = \\left(x + \\frac{b}{2a}\\right)^2 - \\frac{b^2}{4a^2}$.',
        'So $ax^2 + bx + c = a\\left(x + \\frac{b}{2a}\\right)^2 + c - \\frac{b^2}{4a}$, which is vertex form with $h = -\\frac{b}{2a}$ and $k = c - \\frac{b^2}{4a}$.',
        'The square is $0$ at $x = h$ and positive elsewhere, so $y$ is smallest there if $a > 0$ and largest if $a < 0$: the vertex is at $x = -\\frac{b}{2a}$.',
        'The zeros solve $\\left(x + \\frac{b}{2a}\\right)^2 = -\\frac{k}{a} = \\frac{b^2 - 4ac}{4a^2}$. The denominator is positive, so there are two solutions exactly when $b^2 - 4ac > 0$.',
      ],
    }),
  },
])
