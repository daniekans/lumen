import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Linear approximation',
  summary:
    "Near a point, the tangent line is the best straight-line stand-in for a curve. The differentials $dx$ and $dy = f'(x)\\,dx$ measure change along the tangent, and the gap to the true change $\\Delta y$ shrinks faster than $dx$: like $dx^2$ when $f''$ exists.",
  tags: [
    'linear approximation',
    'linearization',
    'differential',
    'tangent line',
    'error',
    'Leibniz notation',
  ],
  level: 'core',
  order: 1,
  codeCorner: 'bottom-right',
  skills: ['linear-approximation'],
  steps: [
    {
      id: 'fit',
      title: 'The tangent as a fit',
      caption:
        'The tangent to $f(x) = \\sqrt{x}$ at $a = 4$ is $L(x) = 2 + \\frac{1}{4}(x - 4)$. Zoomed in around $A$, the curve and the line become hard to tell apart, so near $a$ the line can stand in for the curve.',
    },
    {
      id: 'differentials',
      title: '$dx$ and $dy$',
      caption:
        "Step away from $a$ by $dx$. Along the curve, $y$ changes by $\\Delta y$; along the tangent, by $dy = f'(a)\\,dx$. Drag $dx$: the gap $\\Delta y - dy$ is the error of the approximation.",
    },
    {
      id: 'estimate',
      title: '$\\sqrt{4.1}$ by hand',
      caption:
        'With $dx = 0.1$: $\\sqrt{4.1} \\approx 2 + \\frac{1}{4} \\cdot 0.1 = 2.025$. The true value is $2.02485\\ldots$, so the estimate is off by about $0.00016$, too small to see even at this zoom.',
    },
    {
      id: 'error',
      title: 'The error shrinks like $dx^2$',
      caption:
        "As $dx$ shrinks, the view zooms with it, so $dx$ keeps its length on screen. The gap fades: the error divided by $dx$ goes to $0$, and the error divided by $dx^2$ settles at $\\frac{f''(a)}{2}$, here $-\\frac{1}{64}$.",
    },
    {
      id: 'best',
      title: 'The best linear fit',
      caption:
        "A line through $A$ with any other slope $m$ has an error that, divided by $dx$, tends to $|m - f'(a)|$, not to $0$. Only the tangent fits better and better as $dx$ shrinks. Move $m$ and replay.",
    },
    {
      id: 'ring',
      title: 'An error in a measurement',
      caption:
        'A disk has radius $r = 10$ cm, measured with an error up to $dr$. The area $A = \\pi r^2$ changes by the ring, $\\Delta A$, and $dA = 2\\pi r\\,dr$ is the circumference times the width. Their difference is the small $\\pi\\,dr^2$.',
    },
  ],
})
