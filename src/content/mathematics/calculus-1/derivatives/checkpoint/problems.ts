import { defineProblems, type ProblemGenerator } from '@/lib/practice'
import { problems as basic } from '../practice-basic-rules/problems'
import { problems as chain } from '../practice-chain-rule/problems'
import { problems as implicit } from '../practice-implicit-and-related/problems'
import { problems as definition } from '../difference-quotients/problems'

/** Generators from the unit's practice sets, by set, in the order they appear here. */
const pick = (set: readonly ProblemGenerator[], ids: readonly string[]) =>
  ids.map((id) => set.find((p) => p.id === id)!)

export const problems = defineProblems([
  ...pick(definition, ['difference-quotient', 'derivative-at-point', 'differentiable-join']),
  ...pick(basic, ['product', 'quotient']),
  ...pick(chain, ['trig-of-inner', 'product-with-chain', 'chain-from-values']),
  ...pick(implicit, ['implicit-slope', 'inverse-derivative', 'two-cars']),
  {
    id: 'proof-product-rule',
    title: 'Prove the product rule',
    skills: ['definition', 'basic-rules'],
    difficulty: 3,
    generate: () => ({
      prompt:
        "Let $f$ and $g$ be differentiable at $x$. Using the limit definition, prove that $(fg)'(x) = f'(x)g(x) + f(x)g'(x)$.",
      answer: { kind: 'self' },
      hints: [
        'Add and subtract $f(x)g(x + h)$ in the numerator of the difference quotient.',
        'You need $g(x + h) \\to g(x)$: a differentiable function is continuous.',
      ],
      solution: [
        '$f(x + h)g(x + h) - f(x)g(x) = \\left[f(x + h) - f(x)\\right]g(x + h) + f(x)\\left[g(x + h) - g(x)\\right]$.',
        'Divide by $h \\neq 0$: $\\dfrac{(fg)(x + h) - (fg)(x)}{h} = \\dfrac{f(x + h) - f(x)}{h}\\,g(x + h) + f(x)\\,\\dfrac{g(x + h) - g(x)}{h}$.',
        "As $h \\to 0$ the first quotient tends to $f'(x)$ and the second to $g'(x)$. Since $g$ is differentiable at $x$, it is continuous there, so $g(x + h) \\to g(x)$.",
        "By the limit laws for sums and products, the limit exists and equals $f'(x)g(x) + f(x)g'(x)$.",
      ],
    }),
  },
])
