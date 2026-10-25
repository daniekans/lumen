import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'The product and quotient rules',
  summary:
    "A rectangle with sides $f(x)$ and $g(x)$ has area $fg$. When $x$ moves, it gains two strips and a corner, and in the limit only the strips count: $(fg)' = f'g + fg'$. Reading the same rectangle with a known area gives the quotient rule, and with it the power rule for negative $n$.",
  tags: ['product rule', 'quotient rule', 'power rule', 'derivative', 'rectangle'],
  level: 'core',
  order: 6,
  skills: ['basic-rules'],
  steps: [
    {
      id: 'rectangle',
      title: 'A growing rectangle',
      caption:
        'The rectangle has width $f(x)$ and height $g(x)$, so its area is $f(x)g(x)$. Move $x$ by $\\Delta x$: the width grows by $\\Delta f$, the height by $\\Delta g$, and the area gains a strip $g\\,\\Delta f$, a strip $f\\,\\Delta g$ and a corner $\\Delta f\\,\\Delta g$.',
    },
    {
      id: 'limit',
      title: 'The product rule',
      caption:
        "Divide the gain by $\\Delta x$ and let $\\Delta x \\to 0$. The strips give $g\\frac{\\Delta f}{\\Delta x} \\to f'g$ and $f\\frac{\\Delta g}{\\Delta x} \\to fg'$; the corner has two small factors and vanishes. So $(fg)' = f'g + fg'$.",
    },
    {
      id: 'quotient',
      title: 'The quotient rule',
      caption:
        "Now the area is $f$, the height is $g$ and the width is the quotient $q = \\frac{f}{g}$. The product rule on $f = qg$ gives $f' = q'g + qg'$. Solve for $q'$: $\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$ where $g \\neq 0$.",
    },
    {
      id: 'negative-powers',
      title: 'Negative powers',
      caption:
        'The quotient rule on $\\frac{1}{x^n}$ gives $\\frac{0 \\cdot x^n - 1 \\cdot nx^{n-1}}{x^{2n}} = -nx^{-n-1}$, the power rule with exponent $-n$. The dashed curve is that derivative. It holds wherever $x \\neq 0$. Drag $P$.',
    },
  ],
})
