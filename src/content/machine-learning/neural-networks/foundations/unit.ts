import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Foundations',
  description: 'Neurons, layers, weights and the forward pass.',
  order: 1,
  skills: [{ id: 'forward-pass', title: 'Computing a forward pass' }],
  terms: [
    {
      id: 'neural-network',
      title: 'Neural network',
      summary:
        "A function built from layers of neurons, where each layer computes its activations from the previous layer's with weights, biases and an activation function.",
      introducedIn: 'forward-pass',
    },
    {
      id: 'activation',
      title: 'Activation',
      tex: 'a^{(l)}_j',
      summary:
        'The number a neuron holds, here between 0 and 1. In the input layer the activations are the inputs.',
      introducedIn: 'forward-pass',
    },
    {
      id: 'weights-and-biases',
      title: 'Weights and biases',
      tex: 'w_{ji},\\ b_j',
      summary:
        "The parameters of a neuron: $z_j = \\sum_i w_{ji} a_i + b_j$. A weight scales one input's influence; the bias shifts how easily the neuron activates.",
      introducedIn: 'forward-pass',
    },
    {
      id: 'sigmoid',
      title: 'Sigmoid',
      tex: '\\sigma(z) = \\frac{1}{1 + e^{-z}}',
      summary:
        'An activation function that maps any real $z$ into $(0, 1)$: large positive sums go near 1, large negative sums near 0.',
      introducedIn: 'forward-pass',
    },
    {
      id: 'forward-pass',
      title: 'Forward pass',
      tex: '\\mathbf a^{(l)} = \\sigma(W^{(l)} \\mathbf a^{(l-1)} + \\mathbf b^{(l)})',
      summary:
        "Computing a network's outputs from its inputs, one layer at a time from left to right.",
      introducedIn: 'forward-pass',
    },
  ],
})
