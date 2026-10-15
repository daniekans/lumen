import { Play, RotateCcw } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { fmt } from '@/lib/math'
import { backward, createMLP, forward, mseLoss, sgdStep, type MLP } from '@/lib/nn'
import { vc } from '@/styles/viz-colors'
import { Button, Divider, IconButton } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, Sparkline } from '@/ui/molecules'
import {
  gradientEdge,
  layoutNetwork,
  maxAbs,
  MathLabel,
  NeuralNet,
  Overlay,
  Stage,
  TextLabel,
  useSequence,
  useStepEffect,
  VizControls,
  weightEdge,
} from '@/viz-kit'

const SIZES = [3, 4, 4, 2]
const L = SIZES.length - 1
const INPUT = [0.9, 0.2, 0.6]
const TARGET = [1, 0]
const initialNet = () => createMLP(SIZES, { seed: 9, weightScale: 2 })
const LAYOUT = layoutNetwork(SIZES, { width: 760, height: 400, radius: 26 })
const LAYER_NAMES = ['input', 'hidden 1', 'hidden 2', 'output']
/** `gradFrom = NONE` hides all gradients. Lower values mean the error has travelled further back. */
const NONE = L + 1

const lossOf = (net: MLP) => mseLoss(forward(net, INPUT).a[L]!, TARGET)

export default function Backpropagation() {
  const [net, setNet] = useState(initialNet)
  const netRef = useRef(net)
  const [reveal, setReveal] = useState(L + 1)
  const [showError, setShowError] = useState(false)
  const [gradFrom, setGradFrom] = useState(NONE)
  const [lr, setLr] = useState(2)
  const [history, setHistory] = useState(() => [lossOf(initialNet())])
  const seq = useSequence()

  const pass = useMemo(() => forward(net, INPUT), [net])
  const grads = useMemo(() => backward(net, pass, TARGET), [net, pass])
  const wScale = useMemo(() => maxAbs(net.weights), [net])
  const gScale = useMemo(() => maxAbs(grads.dW), [grads])
  const deltaScale = Math.max(1e-9, ...grads.delta.flat().map(Math.abs))
  const loss = mseLoss(pass.a[L]!, TARGET)

  const commit = (next: MLP) => {
    netRef.current = next
    setNet(next)
    setHistory((h) => [...h, lossOf(next)].slice(-120))
  }

  const step = (n: MLP) => sgdStep(n, backward(n, forward(n, INPUT), TARGET), lr)

  const playForward = async ({ wait }: { wait: (s: number) => Promise<void> }) => {
    setGradFrom(NONE)
    setShowError(false)
    setReveal(1)
    await wait(0.35)
    for (let l = 2; l <= L + 1; l++) {
      setReveal(l)
      await wait(0.4)
    }
  }

  const playBackward = async ({ wait }: { wait: (s: number) => Promise<void> }) => {
    setReveal(L + 1)
    setShowError(true)
    for (let g = L; g >= 0; g--) {
      setGradFrom(g)
      await wait(0.6)
    }
  }

  const fullStep = () =>
    seq.run(async (ctx) => {
      await playForward(ctx)
      setShowError(true)
      await ctx.wait(0.6)
      await playBackward(ctx)
      await ctx.wait(0.3)
      commit(step(netRef.current))
      setGradFrom(NONE)
      setShowError(false)
    })

  const train = (iterations = 60) =>
    seq.run(async ({ wait }) => {
      setReveal(L + 1)
      setGradFrom(NONE)
      setShowError(true)
      for (let k = 0; k < iterations; k++) {
        commit(step(netRef.current))
        await wait(0.07)
      }
    })

  const reset = () => {
    seq.cancel()
    const n = initialNet()
    netRef.current = n
    setNet(n)
    setHistory([lossOf(n)])
    setReveal(L + 1)
    setGradFrom(NONE)
    setShowError(false)
  }

  useStepEffect({
    predict: () => {
      reset()
      void seq.run(playForward)
    },
    loss: () => {
      seq.cancel()
      setReveal(L + 1)
      setGradFrom(NONE)
      setShowError(true)
    },
    backward: () => void seq.run(playBackward),
    update: () =>
      void seq.run(async ({ wait }) => {
        setReveal(L + 1)
        setShowError(true)
        setGradFrom(0)
        await wait(0.5)
        commit(step(netRef.current))
        setGradFrom(NONE)
      }),
    repeat: () => void train(80),
  })

  const edgeStyle = (l: number, j: number, i: number) => {
    if (l >= gradFrom) return gradientEdge(grads.dW[l]![j]![i]!, gScale)
    const dim = gradFrom < NONE ? 0.35 : l + 1 < reveal ? 1 : 0.4
    return weightEdge(net.weights[l]![j]![i]!, wScale, dim)
  }

  const neuronStyle = (l: number, i: number) => {
    const a = pass.a[l]![i]!
    const shown = l < reveal
    const delta = l > 0 ? grads.delta[l]![i]! : 0
    const ringOn = l > 0 && ((showError && l === L) || l >= Math.max(gradFrom, 1))
    return {
      fill: shown ? a : 0,
      value: shown ? fmt(a, 2) : undefined,
      ring: ringOn
        ? { color: vc.yellow, opacity: 0.25 + 0.75 * Math.min(1, Math.abs(delta) / deltaScale) }
        : undefined,
    }
  }

  return (
    <>
      <Stage
        domain={{ x: [-60, 880], y: [-10, 450] }}
        yUp={false}
        ariaLabel="Neural network training on one example with backpropagation"
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel>
              <Readout label="cost $C$" value={fmt(loss, 4)} color={vc.yellow} />
              <Sparkline values={history} min={0} width={170} color={vc.yellow} />
              <Readout label="steps" value={history.length - 1} />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <NeuralNet layout={LAYOUT} edgeStyle={edgeStyle} neuronStyle={neuronStyle} />
        {LAYOUT.neurons[0]!.map((p, i) => (
          <MathLabel
            key={`x${i}`}
            at={[p[0] - 26, p[1]]}
            tex={`x_${i + 1}`}
            anchor="w"
            offset={14}
            color={vc.muted}
          />
        ))}
        {LAYOUT.neurons[L]!.map((p, i) => (
          <MathLabel
            key={`y${i}`}
            at={[p[0] + 26, p[1]]}
            tex={`\\hat y_${i + 1} \\rightarrow y_${i + 1} = ${TARGET[i]}`}
            anchor="e"
            offset={14}
            color={vc.muted}
            size={15}
          />
        ))}
        {LAYOUT.neurons.map((layer, l) => (
          <TextLabel key={l} at={[layer[0]![0], 440]} uppercase size={10.5} color={vc.subtle}>
            {LAYER_NAMES[l]!}
          </TextLabel>
        ))}
      </Stage>

      <VizControls>
        <Button
          variant="primary"
          icon={<Play size={14} />}
          onClick={() => void fullStep()}
          disabled={seq.running}
        >
          One training step
        </Button>
        <Button onClick={() => void train(60)} disabled={seq.running}>
          Train 60 steps
        </Button>
        <Divider />
        <LabeledSlider
          label="learning rate $\eta$"
          value={lr}
          onChange={setLr}
          min={0.1}
          max={5}
          step={0.1}
          format={(v) => fmt(v, 1)}
        />
        <IconButton label="Reset weights" onClick={reset}>
          <RotateCcw size={15} />
        </IconButton>
      </VizControls>
    </>
  )
}
