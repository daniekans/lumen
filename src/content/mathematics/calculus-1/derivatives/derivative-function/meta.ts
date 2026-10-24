import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'The derivative function',
  summary:
    "The slope at every point, plotted as a point of its own, draws a new graph: $f'$. Its sign says where $f$ rises and falls, its zeros mark flat tangents, and it fails to exist at corners, cusps and vertical tangents. $\\frac{d}{dx}$ turns one function into another.",
  tags: ['derivative', 'slope', 'differentiable', 'corner', 'cusp', 'vertical tangent', 'operator'],
  level: 'core',
  order: 3,
  skills: ['derivative-graphs'],
  steps: [
    {
      id: 'trace',
      title: 'Slope, point by point',
      caption:
        "At each $x$, take the slope of the tangent to $f$ and plot it as a height: the point $(x, f'(x))$. As $P$ moves along the curve, those points draw the graph of $f'$.",
    },
    {
      id: 'read',
      title: "Reading $f'$ from $f$",
      caption:
        "Where $f$ rises, $f'$ is above the axis; where it falls, below. The flat tangents at $x = 1$ and $x = 3$ are the zeros of $f'$. At $x = 2$, $f$ falls most steeply, and $f'$ is at its lowest.",
    },
    {
      id: 'corner',
      title: 'A corner',
      caption:
        "At the corner of $f(x) = |x - 2| + 1$, secants from the right have slope $1$ and secants from the left slope $-1$, however small $h$ is. The one-sided limits differ, so $f'(2)$ does not exist, although $f$ is continuous there.",
    },
    {
      id: 'cusp',
      title: 'Cusps and vertical tangents',
      caption:
        'At $x = 2$ the secant slopes grow without bound as $h \\to 0$. For a cusp they go to $\\infty$ on one side and $-\\infty$ on the other; for a vertical tangent they go to $\\infty$ on both. Either way no number is the limit, so there is no derivative at $2$.',
    },
    {
      id: 'operator',
      title: '$\\frac{d}{dx}$ as an operator',
      caption:
        'Differentiation takes a function and returns a function. Written $\\frac{d}{dx}$, it acts on whatever follows: $\\frac{d}{dx}\\left(x^2\\right) = 2x$. Pick a function to see what the operator gives back.',
    },
  ],
})
