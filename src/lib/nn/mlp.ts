import { gaussian, mulberry32 } from '../math/random'

export type ActivationName = 'sigmoid' | 'tanh' | 'relu'

interface Activation {
  f: (z: number) => number
  /** Derivative expressed in terms of z. */
  df: (z: number) => number
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

export const activations: Record<ActivationName, Activation> = {
  sigmoid: { f: sigmoid, df: (z) => sigmoid(z) * (1 - sigmoid(z)) },
  tanh: { f: Math.tanh, df: (z) => 1 - Math.tanh(z) ** 2 },
  relu: { f: (z) => Math.max(0, z), df: (z) => (z > 0 ? 1 : 0) },
}

/**
 * A fully connected network. `weights[l][j][i]` connects neuron i of layer l to neuron j of
 * layer l + 1; `biases[l][j]` belongs to neuron j of layer l + 1.
 */
export interface MLP {
  readonly sizes: readonly number[]
  readonly activation: ActivationName
  readonly weights: number[][][]
  readonly biases: number[][]
}

export interface ForwardPass {
  /** Pre-activations per layer. `z[0]` is empty because the input layer has none. */
  z: number[][]
  /** Activations per layer, `a[0]` being the input. */
  a: number[][]
}

export interface Gradients {
  dW: number[][][]
  db: number[][]
  /** dLoss/dz for every non-input layer, the "error signal" backprop sends backward. */
  delta: number[][]
}

export const createMLP = (
  sizes: readonly number[],
  {
    seed = 7,
    activation = 'sigmoid' as ActivationName,
    /** Multiplier on the initial weights. Larger values give more decisive activations. */
    weightScale = 1,
  } = {},
): MLP => {
  const rand = mulberry32(seed)
  const weights = sizes.slice(1).map((n, l) => {
    const fanIn = sizes[l]!
    return Array.from({ length: n }, () =>
      Array.from({ length: fanIn }, () => (gaussian(rand) * weightScale) / Math.sqrt(fanIn)),
    )
  })
  const biases = sizes
    .slice(1)
    .map((n) => Array.from({ length: n }, () => gaussian(rand) * 0.1 * weightScale))
  return { sizes, activation, weights, biases }
}

export const forward = (net: MLP, input: readonly number[]): ForwardPass => {
  const act = activations[net.activation]
  const z: number[][] = [[]]
  const a: number[][] = [[...input]]
  net.weights.forEach((W, l) => {
    const prev = a[l]!
    const zl = W.map((row, j) => row.reduce((s, w, i) => s + w * prev[i]!, net.biases[l]![j]!))
    z.push(zl)
    a.push(zl.map(act.f))
  })
  return { z, a }
}

/** Mean squared error, halved so its derivative is simply (a - y). */
export const mseLoss = (output: readonly number[], target: readonly number[]) =>
  output.reduce((s, o, i) => s + 0.5 * (o - target[i]!) ** 2, 0)

export const backward = (net: MLP, pass: ForwardPass, target: readonly number[]): Gradients => {
  const act = activations[net.activation]
  const L = net.weights.length
  const delta: number[][] = Array.from({ length: L + 1 }, () => [])
  const out = pass.a[L]!
  delta[L] = out.map((o, j) => (o - target[j]!) * act.df(pass.z[L]![j]!))
  for (let l = L - 1; l >= 1; l--) {
    const Wn = net.weights[l]!
    delta[l] = pass.z[l]!.map(
      (zi, i) => Wn.reduce((s, row, j) => s + row[i]! * delta[l + 1]![j]!, 0) * act.df(zi),
    )
  }
  const dW = net.weights.map((W, l) =>
    W.map((row, j) => row.map((_, i) => delta[l + 1]![j]! * pass.a[l]![i]!)),
  )
  const db = net.biases.map((b, l) => b.map((_, j) => delta[l + 1]![j]!))
  return { dW, db, delta }
}

/** Returns a new network after one gradient descent step. */
export const sgdStep = (net: MLP, grads: Gradients, lr: number): MLP => ({
  ...net,
  weights: net.weights.map((W, l) =>
    W.map((row, j) => row.map((w, i) => w - lr * grads.dW[l]![j]![i]!)),
  ),
  biases: net.biases.map((b, l) => b.map((v, j) => v - lr * grads.db[l]![j]!)),
})
