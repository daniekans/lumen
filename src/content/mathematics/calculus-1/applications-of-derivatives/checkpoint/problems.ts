import { defineProblems, type ProblemGenerator } from '@/lib/practice'
import { problems as curves } from '../practice-curve-analysis/problems'
import { problems as limitsAndNewton } from '../practice-lhopital-and-newton/problems'
import { problems as optimization } from '../practice-optimization/problems'

/** Generators from the unit's practice sets, by set, in the order they appear here. */
const pick = (set: readonly ProblemGenerator[], ids: readonly string[]) =>
  ids.map((id) => set.find((p) => p.id === id)!)

export const problems = defineProblems([
  ...pick(curves, ['differential-error', 'classify', 'absolute-extrema', 'mvt-c', 'inflection']),
  ...pick(optimization, ['can', 'closest-point']),
  ...pick(limitsAndNewton, [
    'zero-over-zero',
    'power-forms',
    'check-the-form',
    'newton-root',
    'newton-behavior',
  ]),
  {
    id: 'proof-same-derivative',
    title: 'Prove: same derivative, a constant apart',
    skills: ['mean-value-theorem'],
    difficulty: 3,
    generate: () => ({
      prompt:
        "Let $f$ and $g$ be differentiable on an open interval $I$, with $f'(x) = g'(x)$ for every $x$ in $I$. Using the mean value theorem, prove that $f - g$ is constant on $I$.",
      answer: { kind: 'self' },
      hints: [
        "Let $h = f - g$. What is $h'$?",
        'Take any two points $x_1 < x_2$ in $I$ and apply the mean value theorem to $h$ on $[x_1, x_2]$.',
      ],
      solution: [
        "Let $h = f - g$. It is differentiable on $I$, with $h'(x) = f'(x) - g'(x) = 0$ for every $x$ in $I$.",
        'Take any $x_1 < x_2$ in $I$. Since $h$ is differentiable on $I$, it is continuous on $[x_1, x_2]$ and differentiable on $(x_1, x_2)$, so the mean value theorem applies.',
        "It gives a $c$ in $(x_1, x_2)$ with $h(x_2) - h(x_1) = h'(c)(x_2 - x_1) = 0 \\cdot (x_2 - x_1) = 0$.",
        'So $h(x_1) = h(x_2)$ for every pair of points of $I$: $h$ is constant, and $f = g + C$.',
        'The interval matters: on a domain made of two intervals, $h$ can be a different constant on each.',
      ],
    }),
  },
])
