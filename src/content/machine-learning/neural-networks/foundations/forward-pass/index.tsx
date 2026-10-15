import { Play, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { fmt, lerp } from '@/lib/math'
import { createMLP, forward } from '@/lib/nn'
import { vc } from '@/styles/viz-colors'
import { Button, Divider, IconButton, Tex } from '@/ui/atoms'
import { LabeledSlider, ReadoutPanel } from '@/ui/molecules'
import {
  layoutNetwork,
  maxAbs,
  MathLabel,
  NeuralNet,
  Overlay,
  Stage,
  TextLabel,
  useCoords,
  useSequence,
  useStepEffect,
  VizControls,
  weightEdge,
  type NetworkLayout,
  type NeuronRef,
} from '@/viz-kit'

const SIZES = [3, 4, 4, 2]
const NET = createMLP(SIZES, { seed: 4, weightScale: 3 })
const LAYOUT = layoutNetwork(SIZES, { width: 760, height: 400, radius: 26 })
const W_SCALE = maxAbs(NET.weights)
const LAYER_NAMES = ['input', 'hidden 1', 'hidden 2', 'output']

type EdgeMode = 'neutral' | 'weights'

export default function ForwardPass() {
  const [input, setInput] = useState([0.3, 0.8, 0.55])
  const [revealed, setRevealed] = useState(1)
  const [mode, setMode] = useState<EdgeMode>('neutral')
  const [focus, setFocus] = useState<NeuronRef | null>(null)
  const [hovered, setHovered] = useState<NeuronRef | null>(null)
  const [pulse, setPulse] = useState<{ layer: number; t: number } | null>(null)
  const seq = useSequence()

  const pass = useMemo(() => forward(NET, input), [input])
  const active = hovered ?? focus

  const runForward = () => {
    setMode('weights')
    setFocus(null)
    void seq.run(async ({ tween, wait }) => {
      setRevealed(1)
      await wait(0.3)
      for (let l = 0; l < SIZES.length - 1; l++) {
        await tween(0, 1, { duration: 0.75, onUpdate: (t) => setPulse({ layer: l, t }) })
        setPulse(null)
        setRevealed(l + 2)
        await wait(0.25)
      }
    })
  }

  const reset = () => {
    seq.cancel()
    setPulse(null)
    setRevealed(1)
    setFocus(null)
  }

  useStepEffect({
    structure: () => {
      reset()
      setMode('neutral')
    },
    weights: () => {
      reset()
      setMode('weights')
    },
    neuron: () => {
      reset()
      setMode('weights')
      setFocus([1, 0])
    },
    forward: runForward,
    output: () => {
      seq.cancel()
      setPulse(null)
      setMode('weights')
      setFocus(null)
      setRevealed(SIZES.length)
    },
  })

  const setInputAt = (i: number) => (v: number) =>
    setInput((x) => x.map((old, k) => (k === i ? v : old)))

  const edgeStyle = (l: number, j: number, i: number) => {
    const w = NET.weights[l]![j]![i]!
    if (mode === 'neutral') return { color: vc.fg, width: 1, opacity: 0.16 }
    let emphasis = 1
    if (active && active[0] > 0) emphasis = l === active[0] - 1 && j === active[1] ? 1 : 0.12
    else if (pulse) emphasis = l === pulse.layer ? 1 : 0.35
    return weightEdge(w, W_SCALE, emphasis)
  }

  const neuronStyle = (l: number, i: number) => {
    const a = pass.a[l]![i]!
    const isActive = active?.[0] === l && active[1] === i
    const shown = l < revealed || isActive
    return {
      fill: shown ? a : 0,
      value: shown ? fmt(a, 2) : undefined,
      ring: isActive ? { color: vc.fg, opacity: 0.8 } : undefined,
    }
  }

  return (
    <>
      <Stage
        domain={{ x: [-60, 820], y: [-10, 450] }}
        yUp={false}
        ariaLabel="A neural network with 3 inputs, two hidden layers of 4 neurons, and 2 outputs"
        overlay={
          active && (
            <Overlay corner="top-left">
              <NeuronPanel neuron={active} pass={pass} />
            </Overlay>
          )
        }
      >
        <NeuralNet
          layout={LAYOUT}
          edgeStyle={edgeStyle}
          neuronStyle={neuronStyle}
          onHover={setHovered}
          onSelect={setFocus}
        />
        {pulse && (
          <Signal
            layout={LAYOUT}
            layer={pulse.layer}
            t={pulse.t}
            activations={pass.a[pulse.layer]!}
            weights={NET.weights[pulse.layer]!}
          />
        )}
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
        {LAYOUT.neurons.at(-1)!.map((p, i) => (
          <MathLabel
            key={`y${i}`}
            at={[p[0] + 26, p[1]]}
            tex={`\\hat y_${i + 1}`}
            anchor="e"
            offset={14}
            color={vc.muted}
          />
        ))}
        {LAYOUT.neurons.map((layer, l) => (
          <TextLabel key={l} at={[layer[0]![0], 440]} uppercase size={10.5} color={vc.subtle}>
            {LAYER_NAMES[l]!}
          </TextLabel>
        ))}
      </Stage>

      <VizControls>
        {input.map((v, i) => (
          <LabeledSlider
            key={i}
            label={`$x_${i + 1}$`}
            value={v}
            onChange={setInputAt(i)}
            min={0}
            max={1}
            step={0.01}
          />
        ))}
        <Divider />
        <Button
          variant="primary"
          icon={<Play size={14} />}
          onClick={runForward}
          disabled={seq.running}
        >
          Run forward pass
        </Button>
        <IconButton label="Reset" onClick={reset}>
          <RotateCcw size={15} />
        </IconButton>
      </VizControls>
    </>
  )
}

/** Dots travelling along every edge of one layer, sized by the signal |w a| they carry. */
function Signal({
  layout,
  layer,
  t,
  activations,
  weights,
}: {
  layout: NetworkLayout
  layer: number
  t: number
  activations: number[]
  weights: number[][]
}) {
  const c = useCoords()
  const contributions = weights.map((row) => row.map((w, i) => w * activations[i]!))
  const scale = Math.max(1e-9, ...contributions.flat().map(Math.abs))
  const fade = Math.min(1, t * 6, (1 - t) * 6)
  return (
    <g pointerEvents="none" style={{ opacity: fade }}>
      {layout.neurons[layer]!.flatMap((from, i) =>
        layout.neurons[layer + 1]!.map((to, j) => {
          const s = contributions[j]![i]!
          const [x, y] = c.toPx([lerp(from[0], to[0], t), lerp(from[1], to[1], t)])
          return (
            <circle
              key={`${i}-${j}`}
              cx={x}
              cy={y}
              r={1.5 + 4 * (Math.abs(s) / scale)}
              style={{ fill: s >= 0 ? vc.blue : vc.red }}
            />
          )
        }),
      )}
    </g>
  )
}

/** The weighted sum behind one neuron, written out with the current numbers. */
function NeuronPanel({
  neuron: [l, j],
  pass,
}: {
  neuron: NeuronRef
  pass: { z: number[][]; a: number[][] }
}) {
  const a = pass.a[l]![j]!
  if (l === 0) {
    return (
      <ReadoutPanel>
        <Tex>{`x_{${j + 1}} = ${fmt(a)}`}</Tex>
        <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-xs)' }}>
          Input values are set directly.
        </span>
      </ReadoutPanel>
    )
  }
  const w = NET.weights[l - 1]![j]!
  const b = NET.biases[l - 1]![j]!
  const prev = pass.a[l - 1]!
  const terms = w
    .map(
      (wi, i) =>
        `${i === 0 ? (wi < 0 ? '-' : '') : wi < 0 ? ' - ' : ' + '}${fmt(Math.abs(wi))}\\cdot${fmt(prev[i]!)}`,
    )
    .join('')
  const z = pass.z[l]![j]!
  const name = `a^{(${l})}_{${j + 1}}`
  return (
    <ReadoutPanel>
      <Tex>{`${name} = \\sigma\\Big(\\sum_i w_{${j + 1}i}\\, a^{(${l - 1})}_i + b_{${j + 1}}\\Big)`}</Tex>
      <span style={{ fontSize: 13 }}>
        <Tex>{`z = ${terms} ${b < 0 ? '-' : '+'} ${fmt(Math.abs(b))} = ${fmt(z)}`}</Tex>
      </span>
      <Tex>{`${name} = \\sigma(${fmt(z)}) = ${fmt(a)}`}</Tex>
    </ReadoutPanel>
  )
}
