import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Transforming graphs',
  summary:
    'Four numbers move a graph without changing its shape: $y = af(b(x - h)) + k$ shifts, stretches and reflects the graph of $f$. Tracked points show where each point goes.',
  tags: ['function', 'transformation', 'shift', 'stretch', 'reflection', 'graph'],
  level: 'intro',
  order: 7,
  skills: ['transform'],
  steps: [
    {
      id: 'vertical-shift',
      title: 'Shift up and down',
      caption:
        'Adding $k$ to the output moves every point up by $k$: the graph of $f(x) + 2$ is the graph of $f$ two units higher.',
    },
    {
      id: 'horizontal-shift',
      title: 'Shift left and right',
      caption:
        'Replacing $x$ with $x - h$ moves the graph right by $h$. The point that $f$ had at $x = 0$ now appears at $x = 2$, because $f(x - 2)$ needs $x = 2$ to feed $f$ the input $0$.',
    },
    {
      id: 'vertical-stretch',
      title: 'Stretch vertically',
      caption:
        'Multiplying the output by $a$ scales every height: $2f(x)$ is twice as tall. Points on the $x$-axis stay where they are.',
    },
    {
      id: 'reflect',
      title: 'Reflect',
      caption:
        'A negative factor reflects. $-f(x)$ flips the graph across the $x$-axis; $f(-x)$ flips it across the $y$-axis. With $f(x) = \\sqrt{x}$ the two flips point in different directions.',
    },
    {
      id: 'horizontal-stretch',
      title: 'Stretch horizontally',
      caption:
        'Multiplying the input by $b$ squeezes the graph toward the $y$-axis by a factor $\\frac{1}{b}$: $\\sqrt{2x}$ reaches height $2$ at $x = 2$ instead of $x = 4$.',
    },
    {
      id: 'combine',
      title: 'All four together',
      caption:
        'In $a\\,f(b(x - h)) + k$ a point $(x_0, y_0)$ of $f$ moves to $\\left(\\frac{x_0}{b} + h,\\ a y_0 + k\\right)$. Change the sliders and follow the yellow points.',
    },
  ],
})
