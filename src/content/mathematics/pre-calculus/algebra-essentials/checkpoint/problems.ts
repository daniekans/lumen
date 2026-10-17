import { defineProblems } from '@/lib/practice'
import { problems as equations } from '../practice-equations-and-inequalities/problems'
import { problems as exponents } from '../practice-exponents-and-radicals/problems'
import { problems as factoring } from '../practice-factoring-and-fractions/problems'

const practice = [...exponents, ...factoring, ...equations]
const pick = (ids: readonly string[]) => practice.filter((p) => ids.includes(p.id))

export const problems = defineProblems([
  ...pick([
    'negative-zero',
    'simplify-radical',
    'leading-coefficient',
    'add-rational',
    'rational-equation',
    'radical-equation',
    'quadratic-inequality',
    'rational-inequality',
    'abs-inequality',
  ]),
  {
    id: 'proof-sqrt-2',
    title: 'Short proof',
    skills: ['radicals'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'Show that $\\sqrt{2}$ is irrational: there are no integers $p$ and $q \\neq 0$ with $\\frac{p}{q} = \\sqrt{2}$.',
      answer: { kind: 'self' },
      hints: [
        'Suppose $\\sqrt{2} = \\frac{p}{q}$ in lowest terms, square both sides, and ask whether $p$ and $q$ are even.',
      ],
      solution: [
        'Suppose $\\sqrt{2} = \\frac{p}{q}$ with integers $p$, $q$ and the fraction in lowest terms, so $p$ and $q$ are not both even.',
        'Squaring gives $p^2 = 2q^2$, so $p^2$ is even. The square of an odd number is odd, so $p$ is even: $p = 2k$.',
        'Then $4k^2 = 2q^2$, so $q^2 = 2k^2$ is even, and $q$ is even too.',
        'Both $p$ and $q$ are even, which contradicts lowest terms. So no such fraction exists, and $\\sqrt{2}$ is irrational.',
      ],
    }),
  },
])
