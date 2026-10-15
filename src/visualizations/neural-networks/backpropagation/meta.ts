import { defineViz } from '@/content/types'

export const meta = defineViz({
  title: 'Backpropagation',
  summary:
    'How a network learns from one example: measure the error, send it backward with the chain rule, and nudge every weight against its gradient.',
  tags: ['neural network', 'backpropagation', 'gradient descent', 'chain rule', 'training', 'loss'],
  level: 'core',
  order: 2,
  steps: [
    {
      id: 'predict',
      title: 'Make a prediction',
      caption:
        'The network runs a forward pass on one training example. Its output $\\hat y$ is compared with the target $y = (1, 0)$.',
    },
    {
      id: 'loss',
      title: 'Measure the error',
      caption:
        "The cost $C = \\tfrac12 \\sum_j (\\hat y_j - y_j)^2$ is one number for how wrong the output is. The rings show each output neuron's error signal $\\delta$.",
    },
    {
      id: 'backward',
      title: 'Send the error backward',
      caption:
        "The chain rule computes each layer's $\\delta$ from the layer after it. Each weight's gradient $\\partial C / \\partial w$ is shown by the width of its yellow edge.",
    },
    {
      id: 'update',
      title: 'Nudge every weight',
      caption:
        'Each weight takes a small step against its gradient, $w \\leftarrow w - \\eta \\, \\partial C / \\partial w$. Run the forward pass again and the cost is lower.',
    },
    {
      id: 'repeat',
      title: 'Repeat',
      caption:
        'Training repeats this loop many times. The weights drift toward values that produce the target, and the cost curve falls.',
    },
  ],
})
