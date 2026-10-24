import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Derivatives',
  description:
    'The derivative as a limit, differentiation rules, the chain rule and implicit differentiation.',
  order: 2,
  skills: [
    { id: 'secant-slope', title: 'Average rate of change as a secant slope' },
    { id: 'definition', title: 'The derivative as a limit of difference quotients' },
    {
      id: 'derivative-graphs',
      title: "Read f' from the graph of f and find where f is not differentiable",
    },
    { id: 'basic-rules', title: 'Differentiate with the power, sum and constant multiple rules' },
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
    {
      id: 'differentiable',
      title: 'Differentiable',
      summary:
        "$f$ is differentiable at $a$ when $f'(a)$ exists: the difference quotient has the same finite limit from both sides. A differentiable function is continuous there, but not the other way around.",
      introducedIn: 'derivative-as-limit',
    },
    {
      id: 'leibniz-notation',
      title: 'Leibniz notation',
      tex: '\\frac{dy}{dx}',
      summary:
        "With $y = f(x)$, the derivative written as $\\frac{dy}{dx} = \\lim_{\\Delta x \\to 0} \\frac{\\Delta y}{\\Delta x}$. For now one symbol for that limit, equal to $f'(x)$.",
      introducedIn: 'derivative-as-limit',
    },
    {
      id: 'locally-linear',
      title: 'Locally linear',
      summary:
        'A function is locally linear at a point when its graph, magnified around that point, becomes indistinguishable from a line: its tangent. Differentiable functions are locally linear.',
      introducedIn: 'derivative-as-limit',
    },
    {
      id: 'derivative-function',
      title: 'Derivative function',
      tex: "f'",
      summary:
        "The function $x \\mapsto f'(x)$, defined wherever $f$ is differentiable. Its sign tells where $f$ rises or falls; its zeros are the flat tangents.",
      introducedIn: 'derivative-function',
    },
    {
      id: 'differentiation-operator',
      title: 'Differentiation operator',
      tex: '\\frac{d}{dx}',
      summary:
        "The operation that takes a function to its derivative: $\\frac{d}{dx} f(x) = f'(x)$, as in $\\frac{d}{dx}\\left(x^2\\right) = 2x$.",
      introducedIn: 'derivative-function',
    },
    {
      id: 'corner-and-cusp',
      title: 'Corner, cusp and vertical tangent',
      summary:
        'Three ways a continuous function fails to be differentiable: one-sided slopes that differ (corner), that go to $\\infty$ and $-\\infty$ (cusp), or to $\\infty$ on both sides (vertical tangent).',
      introducedIn: 'derivative-function',
    },
    {
      id: 'power-rule',
      title: 'Power rule',
      tex: '\\frac{d}{dx}\\left(x^n\\right) = nx^{n-1}',
      summary:
        'The derivative of $x^n$ is $nx^{n-1}$. Proved here for whole numbers $n$ by expanding $(x + h)^n$; it holds for every real exponent $n$ when $x > 0$, as later items show.',
      introducedIn: 'power-and-sum-rules',
    },
    {
      id: 'linearity-of-the-derivative',
      title: 'Linearity of the derivative',
      tex: "(af + bg)' = af' + bg'",
      summary:
        'The derivative of a sum is the sum of the derivatives, and constants factor out. Together they let a polynomial be differentiated term by term.',
      introducedIn: 'power-and-sum-rules',
    },
  ],
})
