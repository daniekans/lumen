import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  title: 'The forward pass',
  summary:
    'How a small neural network turns three input numbers into two outputs, one layer at a time, using weighted sums and a squashing function.',
  tags: ['neural network', 'inference', 'activation', 'weights', 'sigmoid', 'mlp'],
  level: 'intro',
  skills: ['forward-pass'],
  order: 1,
  steps: [
    {
      id: 'structure',
      title: 'Layers of neurons',
      caption:
        'Each circle holds one number, its activation. The left column is the input. Every neuron is connected to every neuron in the next layer.',
    },
    {
      id: 'weights',
      title: 'Weights have a sign and a size',
      caption:
        'Each line carries a weight. Blue lines are positive, red lines are negative, and thicker lines have larger magnitude.',
    },
    {
      id: 'neuron',
      title: 'One neuron, up close',
      caption:
        'A neuron adds up the activations feeding into it, each multiplied by its weight, plus a bias $b$. Then $\\sigma$ squashes the total into $(0, 1)$. Hover any neuron to see its numbers.',
    },
    {
      id: 'forward',
      title: 'Layer by layer',
      caption:
        'The same rule runs for every neuron in a layer, and each layer feeds the next. This is the forward pass.',
    },
    {
      id: 'output',
      title: 'Read the output',
      caption:
        "The last layer is the network's answer. Move the input sliders: the whole pass reruns and the output follows.",
    },
  ],
})
