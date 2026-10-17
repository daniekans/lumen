import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Derivatives',
  description:
    'The derivative as a limit, differentiation rules, the chain rule and implicit differentiation.',
  order: 2,
  skills: [
    { id: 'secant-slope', title: 'Average rate of change as a secant slope' },
    { id: 'definition', title: 'The derivative as a limit of difference quotients' },
  ],
  terms: [
    {
      id: 'difference-quotient',
      title: 'Difference quotient',
      tex: '\\frac{f(x_0 + h) - f(x_0)}{h}',
      summary:
        'The slope of the secant line through $(x_0, f(x_0))$ and $(x_0 + h, f(x_0 + h))$: the average rate of change of $f$ over that step.',
      introducedIn: 'derivative-as-limit',
    },
    {
      id: 'derivative',
      title: 'Derivative',
      tex: "f'(x_0)",
      summary:
        "The limit of the difference quotient as $h \\to 0$, when it exists: the instantaneous rate of change. Computed at every point, it is a new function $f'$.",
      introducedIn: 'derivative-as-limit',
    },
    {
      id: 'tangent-line',
      title: 'Tangent line',
      summary:
        "The line through $(x_0, f(x_0))$ with slope $f'(x_0)$, the limit of the secant lines as the second point approaches the first.",
      introducedIn: 'derivative-as-limit',
    },
  ],
})
