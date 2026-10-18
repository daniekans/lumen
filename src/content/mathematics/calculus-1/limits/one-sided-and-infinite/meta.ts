import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'One-sided and infinite limits',
  summary:
    'A limit can be taken from one side only, and the two-sided limit exists exactly when both sides agree. Values that grow without bound give infinite limits and vertical asymptotes; values that settle as x grows give limits at infinity, decided by the dominant terms.',
  tags: [
    'one-sided limit',
    'jump',
    'infinite limit',
    'vertical asymptote',
    'limit at infinity',
    'horizontal asymptote',
  ],
  level: 'core',
  order: 2,
  skills: ['one-sided-limits', 'limits-at-infinity'],
  steps: [
    {
      id: 'one-sided',
      title: 'From the left and from the right',
      caption:
        'This function jumps at $x = 1$. From the left the values approach $2$, from the right $2 + k$. The two-sided limit exists only when the one-sided limits agree. Move $k$ to $0$.',
    },
    {
      id: 'vertical-asymptote',
      title: 'Infinite limits',
      caption:
        'Near $x = 2$ the values of $\\frac{1}{(x - 2)^m}$ grow without bound. With $m = 1$ the sides go to $-\\infty$ and $+\\infty$, so there is no limit; with $m = 2$ both go to $+\\infty$, and the limit is written $\\infty$.',
    },
    {
      id: 'at-infinity',
      title: 'Limits at infinity',
      caption:
        'As $x$ grows in either direction, $\\frac{2x^2 - 3x}{x^2 + 1}$ settles toward $2$: $\\lim_{x \\to \\pm\\infty} f(x) = 2$, and $y = 2$ is a horizontal asymptote. Move $x$ further out.',
    },
    {
      id: 'dominant-terms',
      title: 'Dominant terms',
      caption:
        'Divide the top and the bottom by the highest power of $x$ in the denominator. Terms such as $\\frac{3}{x}$ fade, and the dashed ratio of leading terms is what remains. Compare the three cases.',
    },
  ],
})
