import { defineProblems } from '@/lib/practice'
import { problems as practice } from '../practice-trigonometry/problems'

export const problems = defineProblems([
  ...practice,
  {
    id: 'tangent-addition-proof',
    title: 'The tangent of a sum',
    skills: ['trig-identities'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'Show that $\\tan(\\alpha + \\beta) = \\dfrac{\\tan\\alpha + \\tan\\beta}{1 - \\tan\\alpha\\tan\\beta}$ whenever $\\cos\\alpha$, $\\cos\\beta$ and $\\cos(\\alpha + \\beta)$ are not $0$.',
      answer: { kind: 'self' },
      hints: [
        'Write $\\tan(\\alpha + \\beta)$ as a quotient and use the addition formulas. Then divide the top and the bottom by $\\cos\\alpha\\cos\\beta$.',
      ],
      solution: [
        'By the addition formulas, $\\tan(\\alpha + \\beta) = \\dfrac{\\sin(\\alpha + \\beta)}{\\cos(\\alpha + \\beta)} = \\dfrac{\\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta}{\\cos\\alpha\\cos\\beta - \\sin\\alpha\\sin\\beta}$, where the bottom is $\\cos(\\alpha + \\beta) \\neq 0$.',
        'Since $\\cos\\alpha\\cos\\beta \\neq 0$, divide the top and the bottom by it. The top becomes $\\frac{\\sin\\alpha}{\\cos\\alpha} + \\frac{\\sin\\beta}{\\cos\\beta} = \\tan\\alpha + \\tan\\beta$.',
        'The bottom becomes $1 - \\frac{\\sin\\alpha}{\\cos\\alpha} \\cdot \\frac{\\sin\\beta}{\\cos\\beta} = 1 - \\tan\\alpha\\tan\\beta$, which is not $0$ because it is $\\frac{\\cos(\\alpha + \\beta)}{\\cos\\alpha\\cos\\beta}$.',
        'The quotient of the two is the formula. With $\\alpha = \\beta = \\theta$ it gives $\\tan 2\\theta = \\frac{2\\tan\\theta}{1 - \\tan^2\\theta}$.',
      ],
    }),
  },
])
