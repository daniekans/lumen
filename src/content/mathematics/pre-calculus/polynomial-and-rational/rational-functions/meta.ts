import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Rational functions',
  summary:
    'A quotient of polynomials blows up where the denominator is zero and settles toward a line far away. The degrees of the numerator and the denominator decide which line.',
  tags: [
    'rational function',
    'vertical asymptote',
    'horizontal asymptote',
    'slant asymptote',
    'hole',
  ],
  level: 'intro',
  order: 3,
  skills: ['asymptotes'],
  steps: [
    {
      id: 'vertical',
      title: 'Vertical asymptotes',
      caption:
        'Near $x = c$ the denominator of $\\frac{1}{(x - c)^m}$ is tiny, so the value is huge. Drag $x$ toward $c$. With $m = 1$ the two sides have opposite signs; with $m = 2$ both go up.',
    },
    {
      id: 'horizontal',
      title: 'Horizontal asymptotes',
      caption:
        'Far away only the leading terms matter. If the numerator has lower degree the values approach $0$; with equal degrees they approach the ratio of the leading coefficients.',
    },
    {
      id: 'slant',
      title: 'Slant asymptotes',
      caption:
        'When the numerator is one degree higher, long division gives $\\frac{x^2 - 1}{x - 2} = x + 2 + \\frac{3}{x - 2}$. The remainder term fades, so the graph approaches the line $y = x + 2$.',
    },
    {
      id: 'sketch',
      title: 'Reading a whole graph',
      caption:
        'Factor first. Cancelled factors leave holes, the rest of the denominator gives vertical asymptotes, the numerator gives zeros. A graph can cross its horizontal asymptote, never a vertical one.',
    },
  ],
})
