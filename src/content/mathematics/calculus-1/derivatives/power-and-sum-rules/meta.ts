import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'The power and sum rules',
  summary:
    'A square of side $x$ grows by two strips, a cube by three slabs: that is why $x^2$ has slope $2x$ and $x^3$ has slope $3x^2$. Expanding $(x + h)^n$ gives the power rule for every whole $n$, and limits of sums give linearity.',
  tags: ['power rule', 'sum rule', 'constant multiple', 'linearity', 'binomial', 'derivative'],
  level: 'core',
  order: 4,
  skills: ['basic-rules'],
  steps: [
    {
      id: 'square',
      title: 'A growing square',
      caption:
        'A square of side $x$ has area $A = x^2$. Grow the side by $\\Delta x$: the area gains two strips of $x\\,\\Delta x$ and a corner of $(\\Delta x)^2$. So $\\frac{\\Delta A}{\\Delta x} = 2x + \\Delta x$, which tends to $2x$.',
    },
    {
      id: 'cube',
      title: 'A growing cube',
      caption:
        'A cube of side $x$ gains three slabs of $x^2\\,\\Delta x$, three rods of $x(\\Delta x)^2$ and a corner of $(\\Delta x)^3$. Divided by $\\Delta x$ and in the limit, only the slabs remain: $\\frac{d}{dx}\\left(x^3\\right) = 3x^2$.',
    },
    {
      id: 'expand',
      title: 'Expanding $(x + h)^n$',
      caption:
        'For any whole $n$, $(x + h)^n = x^n + nx^{n-1}h + (\\text{terms with } h^2)$. Subtract $x^n$, divide by $h$, and every term but $nx^{n-1}$ still has a factor $h$. The secant slope tends to $nx^{n-1}$.',
    },
    {
      id: 'power-rule',
      title: 'The power rule',
      caption:
        '$\\frac{d}{dx}\\left(x^n\\right) = nx^{n-1}$: the dashed curve matches the slope of $x^n$ at every point. For $n = 0$ the function is the constant $1$, with slope $0$. Change $n$ and drag $P$.',
    },
    {
      id: 'linearity',
      title: 'Sums and constant multiples',
      caption:
        "The slope of $af + bg$ at $x$ is $af'(x) + bg'(x)$: stretching a graph by $a$ stretches its slopes by $a$, and adding two graphs adds their slopes. Every polynomial can now be differentiated term by term.",
    },
  ],
})
