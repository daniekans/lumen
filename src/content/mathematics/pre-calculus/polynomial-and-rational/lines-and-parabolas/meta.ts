import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Lines and parabolas',
  summary:
    'The first two polynomials. A line is fixed by its slope and intercept; a parabola is a stretched copy of the basic parabola moved to its vertex, and completing the square finds that vertex.',
  tags: ['slope', 'line', 'parabola', 'vertex form', 'completing the square'],
  level: 'intro',
  order: 1,
  skills: ['lines', 'quadratics'],
  steps: [
    {
      id: 'slope',
      title: 'Slope is rise over run',
      caption:
        'Drag $P$ and $Q$. The slope $m = \\frac{\\Delta y}{\\Delta x}$ is the same for any two points of the line, and the line meets the $y$-axis at its intercept $b$.',
    },
    {
      id: 'vertex',
      title: 'Vertex form',
      caption:
        '$y = a(x - h)^2 + k$ is the graph of $ax^2$ with its vertex moved to $(h, k)$. Drag the vertex and change $a$: the sign of $a$ opens it up or down, its size makes it narrow or wide.',
    },
    {
      id: 'complete',
      title: 'Completing the square',
      caption:
        '$x^2 + bx + c = \\left(x + \\frac{b}{2}\\right)^2 + c - \\frac{b^2}{4}$. So the parabola is $x^2$ moved to the vertex $\\left(-\\frac{b}{2}, c - \\frac{b^2}{4}\\right)$. Move $b$ and $c$.',
    },
    {
      id: 'zeros',
      title: 'Zeros from the vertex',
      caption:
        'Setting $a(x - h)^2 + k = 0$ gives $x = h \\pm \\sqrt{-k/a}$: two zeros at the same distance from the axis of symmetry, one when $k = 0$, none when $k$ and $a$ have the same sign.',
    },
  ],
})
