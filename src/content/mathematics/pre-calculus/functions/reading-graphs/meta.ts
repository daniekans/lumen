import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Reading graphs',
  summary:
    'Four questions a graph answers without a formula: the value at a point, the solutions of an equation, where the function rises or falls, and its largest and smallest values.',
  tags: [
    'function',
    'graph',
    'evaluate',
    'equation',
    'increasing',
    'decreasing',
    'maximum',
    'range',
  ],
  level: 'intro',
  order: 3,
  skills: ['evaluate', 'domain-range'],
  steps: [
    {
      id: 'evaluate',
      title: 'Read an output',
      caption:
        'To read $f(a)$, go up from $a$ on the $x$-axis to the graph, then across to the $y$-axis. Drag $x$ to move the input.',
      check: {
        kind: 'number',
        prompt: 'Read the graph: what is $f(-2)$?',
        answer: 3,
        explanation:
          'Up from $x = -2$, the graph reaches its peak at height $3$. The formula agrees: $f(-2) = \\frac{-8 + 24}{8} + 1 = 3$.',
      },
    },
    {
      id: 'solve',
      title: 'Solve an equation',
      caption:
        'The solutions of $f(x) = c$ are the inputs where the graph meets the horizontal line at height $c$. Read them down on the $x$-axis.',
      check: {
        kind: 'number',
        prompt: 'How many solutions does $f(x) = 1$ have?',
        answer: 3,
        explanation:
          'The line $y = 1$ crosses the graph three times: at $x = 0$ and at $x = \\pm 2\\sqrt{3} \\approx \\pm 3.46$.',
      },
    },
    {
      id: 'monotone',
      title: 'Rising and falling',
      caption:
        '$f$ is increasing where the graph rises from left to right and decreasing where it falls. The turns at $x = -2$ and $x = 2$ split the domain into three pieces.',
      check: {
        kind: 'choice',
        prompt: 'On which interval is $f$ decreasing?',
        options: ['$[-4, -2]$', '$[-2, 2]$', '$[2, 4]$', '$[-1, 3]$'],
        answer: 1,
        explanation:
          'The graph falls from the peak at $x = -2$ to the valley at $x = 2$. Intervals of increase and decrease are written with $x$ values; $[-1, 3]$ lists heights.',
      },
    },
    {
      id: 'extremes',
      title: 'Highest and lowest values',
      caption:
        'The largest value of $f$ is $3$, reached twice, and the smallest is $-1$, also reached twice. Every height in between occurs, so the range is $[-1, 3]$.',
      check: {
        kind: 'choice',
        prompt: 'What is the range of $f$?',
        options: ['$[-4, 4]$', '$[-1, 3]$', '$(-1, 3)$', '$[-2, 2]$'],
        answer: 1,
        explanation:
          'The range collects the heights: from the minimum $-1$ to the maximum $3$, both reached, so the brackets are closed. $[-4, 4]$ is the domain.',
      },
    },
  ],
})
