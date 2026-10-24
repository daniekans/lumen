import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Derivatives of exponentials, logarithms and sine',
  summary:
    "$e^x$ is its own slope, and $b^x$ has slope $\\ln b$ times its height. On the unit circle, the point moves at right angles to the radius, which gives $\\sin' = \\cos$ and $\\cos' = -\\sin$. Reflecting $e^x$ gives $\\frac{d}{dx}\\ln x = \\frac{1}{x}$, and with it the power rule for every real exponent.",
  tags: ['exponential', 'logarithm', 'sine', 'cosine', 'derivative', 'power rule', 'unit circle'],
  level: 'core',
  order: 7,
  skills: ['transcendental-derivatives'],
  steps: [
    {
      id: 'exp',
      title: '$e^x$ is its own slope',
      caption:
        'At every point of $y = e^x$ the slope equals the height: the tangent at $x$ meets the $x$-axis at $x - 1$, so it rises $e^x$ over a run of $1$. The reason is $\\frac{e^{x+h} - e^x}{h} = e^x \\cdot \\frac{e^h - 1}{h}$, and the last factor tends to $1$.',
    },
    {
      id: 'base',
      title: 'Other bases',
      caption:
        'For $b^x$ the same factoring gives $b^x \\cdot \\frac{b^h - 1}{h}$, and that limit is the slope of $b^x$ at $0$, which equals $\\ln b$. So $\\frac{d}{dx}\\left(b^x\\right) = (\\ln b)\\,b^x$. Change $b$: the dashed derivative is the curve scaled by $\\ln b$.',
    },
    {
      id: 'circle',
      title: 'Sine on the unit circle',
      caption:
        "Turn the angle by $\\Delta\\theta$ and the point moves about $\\Delta\\theta$ along the circle, at right angles to the radius. That small step rises $\\cos\\theta\\,\\Delta\\theta$ and moves left $\\sin\\theta\\,\\Delta\\theta$. In the limit, $\\sin' = \\cos$ and $\\cos' = -\\sin$.",
    },
    {
      id: 'sine-graph',
      title: 'The slopes of sine',
      caption:
        'The dashed curve, the slope of $\\sin x$ at each point, is $\\cos x$. The tangent is flat at the peaks, where $\\cos x = 0$, and steepest at the zeros of $\\sin x$, with slope $\\pm 1$. Drag $P$.',
    },
    {
      id: 'log',
      title: '$\\ln x$ by reflection',
      caption:
        'The graph of $\\ln x$ is the graph of $e^x$ reflected across $y = x$, and so are the tangents. A reflection swaps rise and run, so the slopes are reciprocals: at $(x, \\ln x)$ the slope is $\\frac{1}{e^{\\ln x}} = \\frac{1}{x}$.',
    },
    {
      id: 'real-powers',
      title: 'Every real exponent',
      caption:
        'For $x > 0$ and any real $r$, $\\frac{d}{dx}\\left(x^r\\right) = rx^{r-1}$: the power rule with no restriction on the exponent. Try $r = \\frac{1}{2}$, where the slope $\\frac{1}{2\\sqrt{x}}$ grows without bound near $0$.',
    },
  ],
})
