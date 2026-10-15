import { defineViz } from '@/content/types'

export const meta = defineViz({
  title: 'The derivative as a limit',
  summary:
    'A secant line through two points of a curve turns into the tangent line as the points merge. Its slope becomes the derivative.',
  tags: ['derivative', 'limit', 'secant', 'tangent', 'slope', 'rate of change'],
  level: 'intro',
  order: 1,
  steps: [
    {
      id: 'secant',
      title: 'Two points, one line',
      caption:
        'The secant through $P$ and $Q$ rises $\\Delta y$ over a run of $h$. Its slope $\\Delta y / h$ is the average rate of change on that interval.',
    },
    {
      id: 'shrink',
      title: 'Shrink the gap',
      caption: 'Make $h$ smaller. $Q$ slides toward $P$ and the secant pivots around $P$.',
    },
    {
      id: 'limit',
      title: 'Take the limit',
      caption:
        "As $h \\to 0$ the slope settles on a single number, $f'(x_0)$. The line it describes is the tangent at $P$.",
    },
    {
      id: 'function',
      title: 'A new function',
      caption:
        "Repeat this at every $x$ and you get the derivative function $f'(x)$. Drag $P$ and watch its slope trace the dashed curve.",
    },
  ],
})
