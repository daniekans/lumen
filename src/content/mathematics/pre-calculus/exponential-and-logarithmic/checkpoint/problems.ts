import { defineProblems } from '@/lib/practice'
import { problems as practice } from '../practice-exponential-and-logarithmic/problems'

const pick = (ids: readonly string[]) => practice.filter((p) => ids.includes(p.id))

export const problems = defineProblems([
  ...pick([
    'evaluate-log',
    'expand-log',
    'combine-logs',
    'exponential-model',
    'half-life',
    'doubling-time',
    'solve-exponential',
    'solve-with-ln',
    'extraneous-log',
  ]),
  {
    id: 'proof-logarithms',
    title: 'Short proof',
    skills: ['logarithms'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'Let $b > 0$, $b \\neq 1$, and $u, v > 0$. Show that $\\log_b (uv) = \\log_b u + \\log_b v$, and that $\\log_b u = \\frac{\\ln u}{\\ln b}$.',
      answer: { kind: 'self' },
      hints: [
        'Name the logarithms: $m = \\log_b u$ and $n = \\log_b v$, so $u = b^m$ and $v = b^n$.',
        'For the second part, write $u = b^y$ and take $\\ln$ of both sides.',
      ],
      solution: [
        'Let $m = \\log_b u$ and $n = \\log_b v$. By definition $b^m = u$ and $b^n = v$.',
        'Then $uv = b^m b^n = b^{m + n}$ by the exponent laws.',
        'So $m + n$ is the power of $b$ that gives $uv$: $\\log_b (uv) = m + n = \\log_b u + \\log_b v$.',
        'For the second part, let $y = \\log_b u$, so $u = b^y$. Taking $\\ln$ of both sides and using the power law, $\\ln u = y \\ln b$.',
        'Since $b \\neq 1$, $\\ln b \\neq 0$, so $y = \\frac{\\ln u}{\\ln b}$.',
      ],
    }),
  },
])
