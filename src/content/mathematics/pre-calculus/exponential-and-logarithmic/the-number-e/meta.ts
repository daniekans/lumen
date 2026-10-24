import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'The number e',
  summary:
    'Compounding more and more often approaches a limit, the number $e \\approx 2.718$. It is also the one base whose exponential has slope $1$ where it crosses the $y$-axis, so that exponential has a slope equal to its height everywhere. Continuous growth is built on it.',
  tags: ['e', 'compound interest', 'continuous growth', 'natural exponential', 'slope'],
  level: 'intro',
  order: 2,
  skills: ['natural-exponential', 'exponential-models'],
  steps: [
    {
      id: 'compounding',
      title: 'Compounding more often',
      caption:
        'One unit at $100\\%$ a year, compounded $n$ times, grows by $1 + \\frac{1}{n}$ each period and ends the year at $\\left(1 + \\frac{1}{n}\\right)^n$. More periods give more, but never more than $e \\approx 2.718$.',
    },
    {
      id: 'slope-at-zero',
      title: 'The slope at zero',
      caption:
        'Every $b^x$ passes through $(0, 1)$, steeper for larger $b$. The slope there is $1$ for exactly one base, and that base is the same $e$. Move $b$.',
    },
    {
      id: 'slope-equals-height',
      title: 'Slope equals height',
      caption:
        'Since $e^{x + h} = e^x \\cdot e^h$, the curve near any point is the curve near $0$ scaled by $e^x$. So the slope of $e^x$ at every point equals its height: the tangent always meets the axis $1$ to the left. Drag $P$.',
    },
    {
      id: 'continuous-growth',
      title: 'Continuous growth',
      caption:
        'A rate $r$ compounded continuously multiplies by $e^{r}$ per year, so $P$ grows to $Pe^{rt}$. The dashed curve compounds once a year, $(1 + r)^t$, and falls behind.',
    },
  ],
})
