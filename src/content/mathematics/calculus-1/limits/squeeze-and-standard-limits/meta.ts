import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Squeeze and standard limits',
  summary:
    'A function trapped between two others that share a limit has that limit too. With the squeeze theorem and areas on the unit circle, sin x / x tends to 1. The slope of e^x at 0 makes (e^h - 1)/h tend to 1, and (1 + 1/n)^n tends to e. Algebra alone cannot reach these limits.',
  tags: ['squeeze theorem', 'sin x / x', 'unit circle', 'e', 'standard limits'],
  level: 'core',
  order: 5,
  skills: ['standard-limits'],
  steps: [
    {
      id: 'squeeze',
      title: 'The squeeze theorem',
      caption:
        'Near $0$, $x \\sin\\frac{1}{x}$ wiggles faster and faster, and no algebra removes the $\\frac{1}{x}$. But it stays between $-|x|$ and $|x|$, which both tend to $0$, so it is squeezed to $0$ too.',
    },
    {
      id: 'areas',
      title: 'Three areas on the unit circle',
      caption:
        'For an angle $x$ in radians, the small triangle, the sector and the large triangle have areas $\\frac{\\sin x}{2} \\le \\frac{x}{2} \\le \\frac{\\tan x}{2}$. Drag $P$ to change $x$.',
    },
    {
      id: 'sin-over-x',
      title: 'Squeezing $\\frac{\\sin x}{x}$',
      caption:
        'Divide the inequality by $\\frac{\\sin x}{2}$ and flip it: $\\cos x \\le \\frac{\\sin x}{x} \\le 1$. As $x \\to 0$, $\\cos x \\to 1$, so $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$, although $x = 0$ gives $\\frac{0}{0}$.',
    },
    {
      id: 'exponential',
      title: 'The slope of $e^x$ at $0$',
      caption:
        'The secant of $b^x$ from $0$ to $h$ has slope $\\frac{b^h - 1}{h}$. As $h \\to 0$ it tends to $\\ln b$, and $e$ is the base where that limit is exactly $1$. Change the base and drag $h$.',
    },
    {
      id: 'compound',
      title: '$(1 + \\frac{1}{n})^n$',
      caption:
        'With $t = \\frac{1}{n}$, the values $(1 + \\frac{1}{n})^n = (1 + t)^{1/t}$ climb toward $e \\approx 2.71828$ as $n$ grows: base $\\to 1$, exponent $\\to \\infty$, and the result is neither $1$ nor $\\infty$.',
    },
  ],
})
