import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Training',
  description: 'Cost functions, backpropagation and gradient descent.',
  order: 2,
  skills: [{ id: 'backpropagation', title: 'Backpropagation and the gradient step' }],
  terms: [
    {
      id: 'cost-function',
      title: 'Cost',
      tex: 'C',
      summary:
        'A number that measures how far the outputs are from the targets, here $C = \\frac12 \\sum_j (\\hat y_j - y_j)^2$. Training tries to make it small.',
      introducedIn: 'backpropagation',
    },
    {
      id: 'error-signal',
      title: 'Error signal',
      tex: '\\delta_j = \\partial C / \\partial z_j',
      summary:
        "How sensitive the cost is to one neuron's weighted sum. Backpropagation computes it layer by layer, from the output backward.",
      introducedIn: 'backpropagation',
    },
    {
      id: 'backpropagation',
      title: 'Backpropagation',
      summary:
        'The algorithm that computes the gradient of the cost for every weight at once, by applying the chain rule from the output layer back to the input: $\\partial C / \\partial w_{ji} = a_i \\delta_j$.',
      introducedIn: 'backpropagation',
    },
    {
      id: 'gradient-descent',
      title: 'Gradient descent',
      tex: 'w \\leftarrow w - \\eta\\, \\frac{\\partial C}{\\partial w}',
      summary: 'Moving every weight a small step against its gradient, so the cost goes downhill.',
      introducedIn: 'backpropagation',
    },
    {
      id: 'learning-rate',
      title: 'Learning rate',
      tex: '\\eta',
      summary:
        'The size of a gradient descent step. Too small learns slowly; too large overshoots and the cost jumps instead of falling.',
      introducedIn: 'backpropagation',
    },
  ],
})
