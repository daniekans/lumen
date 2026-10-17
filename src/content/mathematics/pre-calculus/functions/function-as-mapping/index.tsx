import { useState } from 'react'
import { clamp, distance, fmt, lerpVec, linspace, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  MathLabel,
  Overlay,
  Path,
  Point,
  Segment,
  Stage,
  TextLabel,
  useAnimatedValue,
  useSequence,
  useStepEffect,
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

const f = (x: number) => x * x
/** The sideways parabola x = (y - 2)^2 - 2 is not the graph of a function of x. */
const sideways = (y: number) => (y - 2) ** 2 - 2

const Y_VIEW: [number, number] = [-1.4, 5.4]
const X_LIMIT = 2.3

const inputs = [2, 1, 0, -1, -2]
const outputs = [4, 1, 0]
/** Positions of the two columns in the mapping view. */
const inputAt = (i: number): Vec2 => [-3, 4 - i]
const outputAt = (v: number): Vec2 => [3, { 4: 3.5, 1: 2, 0: 0.5 }[v] ?? 0]

const ellipse = (cx: number, cy: number, rx: number, ry: number): Vec2[] =>
  linspace(0, 2 * Math.PI, 72).map((a) => [cx + rx * Math.cos(a), cy + ry * Math.sin(a)])

/** Moves `a` toward `b` by `d` stage units, without passing it. */
const trim = (a: Vec2, b: Vec2, d: number): Vec2 => {
  const len = distance(a, b)
  return len <= d ? b : lerpVec(a, b, d / len)
}

type Curve = 'parabola' | 'sideways'

export default function FunctionAsMapping() {
  const { id } = useVizStep()
  const [t, setT] = useState(0)
  const [p, setP] = useState(0)
  const [x, setX] = useState(1.5)
  const [curve, setCurve] = useState<Curve>('parabola')
  const [bad, setBad] = useState(false)
  const seq = useSequence()

  const badOpacity = useAnimatedValue(bad ? 1 : 0, { duration: 0.5 })
  const reading = id === 'curve' || id === 'vertical-line'
  const testing = id === 'vertical-line'
  const arrowsOpacity = useAnimatedValue(testing ? 0 : reading ? 0.3 : 1, { duration: 0.6 })
  const guideOpacity = useAnimatedValue(reading && curve === 'parabola' ? 1 : 0, { duration: 0.5 })
  const lineOpacity = useAnimatedValue(testing ? 1 : 0, { duration: 0.5 })
  const sidewaysOpacity = useAnimatedValue(testing && curve === 'sideways' ? 1 : 0, {
    duration: 0.6,
  })

  const fold = (to: number) =>
    seq.run(({ tween }) => tween(t, to, { duration: 1.6, onUpdate: setT }))

  /** Folds into the graph view (if needed), then draws the curve from left to right. */
  const drawCurve = (duration: number) =>
    seq.run(async ({ tween }) => {
      await tween(t, 1, { duration: 1.2 * (1 - t), onUpdate: setT })
      await tween(p, 1, { duration: duration * (1 - p), onUpdate: setP })
    })

  useStepEffect({
    mapping: () => {
      setBad(false)
      setP(0)
      setCurve('parabola')
      fold(0)
    },
    'one-output': () => {
      setBad(true)
      setP(0)
      setCurve('parabola')
      fold(0)
    },
    graph: () => {
      setBad(false)
      setP(0)
      setCurve('parabola')
      fold(1)
    },
    curve: () => {
      setBad(false)
      setCurve('parabola')
      drawCurve(1.6)
    },
    'vertical-line': () => {
      setBad(false)
      drawCurve(0.8)
    },
  })

  const dragX = (v: number) => setX(clamp(v, -X_LIMIT, X_LIMIT))

  // Arrow for each input: straight in the mapping view, "up, then across" in the graph view.
  const arrows = inputs.map((v, i) => {
    const out = f(v)
    const a = inputAt(i)
    const b = outputAt(out)
    const start = lerpVec(a, [v, 0], t)
    const corner = lerpVec(lerpVec(a, b, 0.5), [v, out], t)
    const end = lerpVec(b, [0, out], t)
    const gap = 0.32 * (1 - t) + 0.14 * t
    return {
      v,
      out,
      start,
      corner,
      end,
      from: trim(start, corner, gap),
      to: trim(end, corner, gap),
    }
  })

  const crossings =
    curve === 'parabola'
      ? [f(x)]
      : x < -2
        ? []
        : x === -2
          ? [2]
          : [2 - Math.sqrt(x + 2), 2 + Math.sqrt(x + 2)]
  const hitColor = crossings.length > 1 ? vc.red : vc.yellow
  const fx = f(x)

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-5.5, 5.5], y: Y_VIEW }}
        ariaLabel="Mapping from inputs to outputs that folds into the graph of f(x) = x squared"
        overlay={
          reading && (
            <Overlay corner="top-right">
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(x)} color={vc.yellow} />
                {testing ? (
                  <Readout label="crossings" value={crossings.length} color={hitColor} />
                ) : (
                  <Readout label="$f(x)$" value={fmt(fx)} color={vc.blue} />
                )}
              </ReadoutPanel>
            </Overlay>
          )
        }
      >
        <g style={{ opacity: t }}>
          <Grid />
          <Axes />
        </g>

        {/* The two sets of the mapping view. */}
        <g style={{ opacity: 1 - t }}>
          <Path points={ellipse(-3, 2, 0.9, 2.75)} color={vc.subtle} width={1.25} closed />
          <Path points={ellipse(3, 2, 0.9, 2.25)} color={vc.subtle} width={1.25} closed />
          <TextLabel at={[-3, 5.1]} uppercase>
            inputs
          </TextLabel>
          <TextLabel at={[3, 4.6]} uppercase>
            outputs
          </TextLabel>
        </g>
        <MathLabel at={[0, 4.9]} tex="f(x) = x^2" color={vc.blue} opacity={1 - t} />

        {p > 0.001 && (
          <FunctionPlot
            f={f}
            domain={[-X_LIMIT, -X_LIMIT + 2 * X_LIMIT * p]}
            color={vc.blue}
            opacity={1 - 0.8 * sidewaysOpacity}
          />
        )}
        <MathLabel
          at={[X_LIMIT, f(X_LIMIT)]}
          tex="f(x) = x^2"
          color={vc.blue}
          anchor="e"
          offset={14}
          opacity={p * (1 - sidewaysOpacity)}
        />

        <g style={{ opacity: arrowsOpacity }}>
          {arrows.map(({ v, from, corner, to }) => (
            <g key={v}>
              <Path points={[from, corner]} color={vc.blue} width={2} />
              <Vector from={corner} to={to} color={vc.blue} width={2} head={10} />
            </g>
          ))}
        </g>
        <g style={{ opacity: badOpacity }}>
          <Vector
            from={trim(inputAt(1), outputAt(4), 0.32)}
            to={trim(outputAt(4), inputAt(1), 0.32)}
            color={vc.red}
            width={2}
            head={10}
          />
        </g>

        {arrows.map(({ v, start, out, corner }) => (
          <g key={v} style={{ opacity: Math.max(1 - t, arrowsOpacity) }}>
            <Point at={start} color={vc.fg} r={4.5} />
            {t > 0.6 && (
              <g style={{ opacity: (t - 0.6) / 0.4 }}>
                <Point at={corner} color={vc.blue} r={4.5} />
              </g>
            )}
            <MathLabel at={inputAt(inputs.indexOf(v))} tex={String(v)} anchor="w" opacity={1 - t} />
            <MathLabel at={outputAt(out)} tex={String(out)} anchor="e" opacity={1 - t} />
          </g>
        ))}
        {outputs.map((v) => (
          <g key={v} style={{ opacity: Math.max(1 - t, arrowsOpacity) }}>
            <Point at={lerpVec(outputAt(v), [0, v], t)} color={vc.fg} r={4.5} />
          </g>
        ))}

        {/* Reading f(x) off the graph: up from x, then across to the y-axis. */}
        <g style={{ opacity: guideOpacity }}>
          <Segment from={[x, 0]} to={[x, fx]} color={vc.yellow} width={1.5} dash="4 5" />
          <Vector
            from={[x, fx]}
            to={trim([0, fx], [x, fx], 0.12)}
            color={vc.yellow}
            width={1.5}
            head={9}
          />
          <Point at={[0, fx]} color={vc.yellow} r={4} />
          <MathLabel
            at={[0, fx]}
            tex="f(x)"
            color={vc.yellow}
            anchor="w"
            offset={12}
            size={15}
            opacity={guideOpacity}
          />
        </g>

        {sidewaysOpacity > 0.01 && (
          <Path
            points={linspace(Y_VIEW[0], Y_VIEW[1], 160).map((y) => [sideways(y), y] as const)}
            color={vc.blue}
            width={2.5}
            opacity={sidewaysOpacity}
          />
        )}
        <g style={{ opacity: lineOpacity }}>
          <Segment from={[x, 0]} to={[x, 1]} extend color={vc.yellow} width={1.5} dash="6 6" />
          {crossings.map((y) => (
            <Point key={y} at={[x, y]} color={hitColor} r={5.5} />
          ))}
        </g>

        {reading && (
          <>
            <Point at={[x, 0]} color={vc.yellow} r={6} onDrag={([v]) => dragX(v)} label="x" />
            <MathLabel at={[x, 0]} tex="x" color={vc.yellow} anchor="s" offset={12} />
          </>
        )}
      </Stage>

      <VizControls>
        {reading ? (
          <>
            <LabeledSlider
              label="$x$"
              value={x}
              onChange={dragX}
              min={-X_LIMIT}
              max={X_LIMIT}
              step={0.01}
              color={vc.yellow}
            />
            {testing && (
              <SegmentedControl
                label="Curve"
                value={curve}
                onChange={setCurve}
                options={[
                  { value: 'parabola', label: 'y = x²' },
                  { value: 'sideways', label: 'x = (y − 2)² − 2' },
                ]}
              />
            )}
          </>
        ) : (
          <SegmentedControl
            label="View"
            value={t > 0.5 ? 'graph' : 'mapping'}
            onChange={(v) => fold(v === 'graph' ? 1 : 0)}
            options={[
              { value: 'mapping', label: 'Mapping' },
              { value: 'graph', label: 'Graph' },
            ]}
          />
        )}
      </VizControls>
    </>
  )
}
