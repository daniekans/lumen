import { useState } from 'react'
import { clamp, fmt } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  MathLabel,
  Overlay,
  Point,
  Segment,
  Stage,
  useAnimatedValue,
  useSequence,
  useStepEffect,
  useVizStep,
  VizControls,
} from '@/viz-kit'

type StepId = 'hole' | 'excluded' | 'multiply' | 'add'

interface Example {
  /** The expression as written, evaluated literally so excluded values give NaN or Infinity. */
  original: (x: number) => number
  /** The simplified form, used to draw the graph and to place the holes. */
  simplified: (x: number) => number
  originalTex: string
  simplifiedTex: string
  holes: readonly number[]
  asymptotes: readonly number[]
  start: number
}

const g = (x: number) => 1 / (x - 1)
const h = (x: number) => 1 / (x + 1)

const EXAMPLES: Record<StepId, Example> = {
  hole: {
    original: (x) => (x * x - x - 6) / (x - 3),
    simplified: (x) => x + 2,
    originalTex: '\\dfrac{x^2 - x - 6}{x - 3}',
    simplifiedTex: 'x + 2,\\ x \\neq 3',
    holes: [3],
    asymptotes: [],
    start: 1,
  },
  excluded: {
    original: (x) => (x + 2) / (x * x + x - 2),
    simplified: g,
    originalTex: '\\dfrac{x + 2}{x^2 + x - 2}',
    simplifiedTex: '\\dfrac{1}{x - 1},\\ x \\neq -2',
    holes: [-2],
    asymptotes: [1],
    start: -3.5,
  },
  multiply: {
    original: (x) => (((x * x - 1) / (x + 2)) * (x + 2)) / (x + 1),
    simplified: (x) => x - 1,
    originalTex: '\\dfrac{x^2 - 1}{x + 2} \\cdot \\dfrac{x + 2}{x + 1}',
    simplifiedTex: 'x - 1,\\ x \\neq -2, -1',
    holes: [-2, -1],
    asymptotes: [],
    start: 1,
  },
  add: {
    original: (x) => g(x) + h(x),
    simplified: (x) => (2 * x) / (x * x - 1),
    originalTex: '\\dfrac{1}{x - 1} + \\dfrac{1}{x + 1}',
    simplifiedTex: '\\dfrac{2x}{x^2 - 1}',
    holes: [],
    asymptotes: [-1, 1],
    start: 2,
  },
}

const X_MIN = -4.5
const X_MAX = 4.5

export default function RationalExpressions() {
  const step = useVizStep().id as StepId
  const ex = EXAMPLES[step] ?? EXAMPLES.hole
  const [x, setX] = useState(ex.start)
  const seq = useSequence()

  const glide = (to: number) =>
    void seq.run(({ tween }) => tween(to - 1.5, to, { duration: 1, onUpdate: setX }))
  useStepEffect({
    hole: () => glide(EXAMPLES.hole.start),
    excluded: () => glide(EXAMPLES.excluded.start),
    multiply: () => glide(EXAMPLES.multiply.start),
    add: () => glide(EXAMPLES.add.start),
  })

  const move = (v: number) => {
    seq.cancel()
    setX(Math.round(clamp(v, X_MIN, X_MAX) * 20) / 20)
  }

  const isAdd = step === 'add'
  const partsOpacity = useAnimatedValue(isAdd ? 1 : 0, { duration: 0.5 })
  const y = ex.original(x)
  const defined = Number.isFinite(y)
  const onStage = defined && Math.abs(y) < 5.5

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-5, 5], y: [-5, 6] }}
        ariaLabel="Graph of a rational expression with its holes and vertical asymptotes"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout label="expression" value={<Tex>{ex.originalTex}</Tex>} color={vc.blue} />
              <Readout label="simplified" value={<Tex>{ex.simplifiedTex}</Tex>} color={vc.blue} />
              <Readout label="$x$" value={fmt(x)} color={isAdd ? vc.blue : vc.yellow} />
              {isAdd && defined && (
                <>
                  <Readout label="$\frac{1}{x - 1}$" value={fmt(g(x))} color={vc.teal} />
                  <Readout label="$\frac{1}{x + 1}$" value={fmt(h(x))} color={vc.yellow} />
                </>
              )}
              <Readout
                label="value"
                value={defined ? fmt(y) : 'undefined'}
                color={isAdd ? vc.blue : vc.yellow}
              />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {ex.asymptotes.map((a) => (
          <Segment key={a} from={[a, -5]} to={[a, 6]} color={vc.muted} width={1.25} dash="4 6" />
        ))}

        <g style={{ opacity: partsOpacity }}>
          <FunctionPlot f={g} color={vc.teal} width={1.75} />
          <FunctionPlot f={h} color={vc.yellow} width={1.75} />
        </g>
        <FunctionPlot key={step} f={ex.simplified} color={vc.blue} />

        {ex.holes.map((a) => (
          <Point key={`${step}-${a}`} at={[a, ex.simplified(a)]} color={vc.blue} hollow />
        ))}

        {isAdd && defined && onStage && (
          <>
            <Segment from={[x, 0]} to={[x, g(x)]} color={vc.teal} width={3} />
            <Segment from={[x, g(x)]} to={[x, y]} color={vc.yellow} width={3} />
          </>
        )}
        {onStage && (
          <Point
            at={[x, y]}
            color={isAdd ? vc.blue : vc.yellow}
            onDrag={([px]) => move(px)}
            label="x"
          />
        )}
        {!defined && ex.holes.includes(x) && (
          <MathLabel
            at={[x, ex.simplified(x)]}
            tex={`\\frac{0}{0}`}
            color={vc.yellow}
            anchor="nw"
            offset={12}
          />
        )}
      </Stage>

      <VizControls>
        <LabeledSlider
          label="$x$"
          value={x}
          onChange={move}
          min={X_MIN}
          max={X_MAX}
          step={0.05}
          format={fmt}
          color={isAdd ? vc.blue : vc.yellow}
        />
      </VizControls>
    </>
  )
}
