import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'A function as a mapping',
  summary:
    'A function sends each input to exactly one output. Folding the arrows of a mapping onto two axes turns it into a graph, and the vertical line test reads the rule back off the graph.',
  tags: ['function', 'mapping', 'input', 'output', 'graph', 'vertical line test'],
  level: 'intro',
  order: 1,
  skills: ['definition', 'evaluate'],
  steps: [
    {
      id: 'mapping',
      title: 'Inputs, a rule, outputs',
      caption:
        'The rule $f(x) = x^2$ sends each input on the left to an output on the right. The arrow from $2$ ends at $4$, so $f(2) = 4$.',
    },
    {
      id: 'one-output',
      title: 'One output per input',
      caption:
        'Two inputs may share an output: $f(-1) = f(1) = 1$. One input with two outputs is not allowed, so the red arrow would break the rule.',
    },
    {
      id: 'graph',
      title: 'Fold the mapping into a graph',
      caption:
        'Inputs slide onto the $x$-axis and outputs onto the $y$-axis. Each arrow bends to go up, then across, and its corner is the point $(x, f(x))$.',
    },
    {
      id: 'curve',
      title: 'Every input at once',
      caption:
        'Taking every real number as an input fills the corners into a curve, the graph of $f$. Drag $x$ to read $f(x)$ off the $y$-axis.',
    },
    {
      id: 'vertical-line',
      title: 'The vertical line test',
      caption:
        'A vertical line at $x$ meets the graph of a function at most once. Switch to the sideways parabola: some lines cross it twice, so it is not the graph of a function of $x$.',
    },
  ],
})
