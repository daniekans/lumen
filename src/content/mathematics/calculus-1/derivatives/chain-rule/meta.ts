import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'The chain rule',
  summary:
    "A function stretches a small interval around $x$ by the factor $g'(x)$. A composition stretches twice, so the factors multiply: $(f \\circ g)'(x) = f'(g(x))\\,g'(x)$. In Leibniz notation $\\frac{dy}{dx} = \\frac{dy}{du}\\frac{du}{dx}$, which looks like cancelling because the increments really do cancel. Rates with units multiply the same way, and so do the layers of a neural network.",
  tags: ['chain rule', 'composition', 'derivative', 'leibniz notation', 'stretching'],
  level: 'core',
  order: 9,
  skills: ['chain-rule'],
  steps: [
    {
      id: 'stretch',
      title: 'A function stretches intervals',
      caption:
        "Send each point $x$ of the lower line to $u = g(x) = \\frac{x^2}{2}$ on the line above. A short interval of length $\\Delta x$ lands on one of length $\\Delta u$, about $g'(x)\\,\\Delta x$. Near $0$ the map squeezes, far out it stretches.",
    },
    {
      id: 'compose',
      title: 'Two stretches',
      caption:
        "Now send $u$ to $y = f(u) = 2\\sin u$ on a third line. The interval is stretched by about $g'(x)$, then by about $f'(u)$. Where $f'(u) < 0$ the second map also flips it, and the connecting lines cross.",
    },
    {
      id: 'leibniz',
      title: 'Why it looks like cancelling',
      caption:
        "For any $\\Delta x$ with $\\Delta u \\neq 0$, $\\frac{\\Delta y}{\\Delta x} = \\frac{\\Delta y}{\\Delta u} \\cdot \\frac{\\Delta u}{\\Delta x}$ exactly. As $\\Delta x \\to 0$ each factor tends to a derivative: $\\frac{dy}{dx} = \\frac{dy}{du}\\frac{du}{dx}$, that is $f'(g(x))\\,g'(x)$.",
    },
    {
      id: 'graph',
      title: 'The slope of the composition',
      caption:
        'The graph of $y = 2\\sin\\left(\\frac{x^2}{2}\\right)$ with its tangent at $P$. Its slope is $2\\cos\\left(\\frac{x^2}{2}\\right) \\cdot x$: the outer derivative at the inner value, times the inner derivative. Drag $P$.',
    },
  ],
})
