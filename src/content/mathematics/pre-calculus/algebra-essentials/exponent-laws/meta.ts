import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Exponent laws',
  summary:
    'A power is a row of equal factors. Multiplying joins rows, dividing cancels factors in pairs, and the same picture explains zero and negative exponents.',
  tags: ['exponent', 'power', 'product rule', 'quotient rule', 'negative exponent'],
  level: 'intro',
  order: 1,
  skills: ['exponents'],
  steps: [
    {
      id: 'repeated',
      title: 'Repeated multiplication',
      caption:
        '$a^m$ is $m$ factors of $a$ multiplied together. Each tile is one factor; change $m$ and the base $a$.',
    },
    {
      id: 'product',
      title: 'Multiplying powers',
      caption:
        'Multiplying $a^m$ by $a^n$ puts $m$ factors next to $n$ more, so $a^m \\cdot a^n = a^{m + n}$. The exponents add.',
    },
    {
      id: 'quotient',
      title: 'Dividing powers',
      caption:
        'In $\\frac{a^m}{a^n}$ each factor below the bar cancels one above it, since $\\frac{a}{a} = 1$. What is left is $a^{m - n}$.',
    },
    {
      id: 'zero',
      title: 'Zero exponent',
      caption:
        'With the same number of factors above and below, everything cancels and the quotient is $1$. The rule $a^{m - m} = a^0$ then forces $a^0 = 1$, for any $a \\neq 0$.',
    },
    {
      id: 'negative',
      title: 'Negative exponents',
      caption:
        'With more factors below the bar, the leftovers stay below: $\\frac{a^1}{a^4} = \\frac{1}{a^3}$. The rule gives $a^{1 - 4} = a^{-3}$, so $a^{-n} = \\frac{1}{a^n}$.',
    },
    {
      id: 'power',
      title: 'A power of a power',
      caption:
        '$(a^m)^n$ is $n$ copies of the row $a^m$: a grid of $n$ rows and $m$ columns, so $(a^m)^n = a^{mn}$. The exponents multiply.',
    },
  ],
})
