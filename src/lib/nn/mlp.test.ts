import { describe, expect, it } from 'vitest'
import { backward, createMLP, forward, mseLoss, sgdStep } from '.'

describe('mlp', () => {
  const input = [0.3, 0.8, 0.5]
  const target = [1, 0]

  it('is deterministic for a given seed', () => {
    expect(createMLP([3, 4, 2], { seed: 3 })).toEqual(createMLP([3, 4, 2], { seed: 3 }))
  })

  it('backprop gradients match finite differences', () => {
    const net = createMLP([3, 4, 4, 2], { seed: 11 })
    const grads = backward(net, forward(net, input), target)
    const eps = 1e-6
    const loss = (n: typeof net) => mseLoss(forward(n, input).a.at(-1)!, target)
    for (const [l, j, i] of [
      [0, 1, 2],
      [1, 3, 0],
      [2, 0, 1],
    ] as const) {
      const bumped = structuredClone(net)
      bumped.weights[l]![j]![i]! += eps
      const numeric = (loss(bumped) - loss(net)) / eps
      expect(grads.dW[l]![j]![i]).toBeCloseTo(numeric, 5)
    }
  })

  it('gradient descent reduces the loss', () => {
    let net = createMLP([3, 4, 4, 2], { seed: 5 })
    const before = mseLoss(forward(net, input).a.at(-1)!, target)
    for (let k = 0; k < 50; k++) net = sgdStep(net, backward(net, forward(net, input), target), 1)
    const after = mseLoss(forward(net, input).a.at(-1)!, target)
    expect(after).toBeLessThan(before / 2)
  })
})
