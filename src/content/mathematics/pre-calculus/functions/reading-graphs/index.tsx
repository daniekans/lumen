import { useState } from 'react'
import { clamp, fmt } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  AxisInterval,
  Axes,
  FunctionPlot,
  Grid,
  MathLabel,
  Overlay,
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

const f = (x: number) => (x ** 3 - 12 * x) / 8 + 1
const A = -4
const B = 4

/** Real solutions of f(x) = c on [A, B], by bisection between sign changes. */
const solve = (c: number) => {
  const g = (x: number) => f(x) - c
  const out: number[] = []
  const n = 400
  for (let i = 0; i < n; i++) {
    let a = A + ((B - A) * i) / n
    let b = A + ((B - A) * (i + 1)) / n
    if (Math.abs(g(a)) < 1e-9) out.push(a)
    if (g(a) * g(b) >= 0) continue
    for (let k = 0; k < 50; k++) {
      const m = (a + b) / 2
      if (g(a) * g(m) <= 0) b = m
      else a = m
    }
    out.push((a + b) / 2)
  }
  if (Math.abs(g(B)) < 1e-9) out.push(B)
  return out
}

export default function ReadingGraphs() {
  const { id } = useVizStep()
  const [x, setX] = useState(1)
  const [c, setC] = useState(2)
  const seq = useSequence()

  const showX = id === 'evaluate'
  const showC = id === 'solve'
  const monotone = id === 'monotone'
  const extremes = id === 'extremes'
  const xOpacity = useAnimatedValue(showX ? 1 : 0, { duration: 0.5 })
  const cOpacity = useAnimatedValue(showC ? 1 : 0, { duration: 0.5 })
  const monoOpacity = useAnimatedValue(monotone ? 1 : 0, { duration: 0.6 })
  const extOpacity = useAnimatedValue(extremes ? 1 : 0, { duration: 0.6 })

  useStepEffect({
    evaluate: () => seq.run(({ tween }) => tween(x, 1, { duration: 1, onUpdate: setX })),
    solve: () => seq.run(({ tween }) => tween(c, 2, { duration: 1, onUpdate: setC })),
  })

  const moveX = (v: number) => {
    seq.cancel()
    setX(Math.round(clamp(v, A, B) * 100) / 100)
  }
  const moveC = (v: number) => {
    seq.cancel()
    setC(Math.round(clamp(v, -2, 4) * 100) / 100)
  }

  const fx = f(x)
  const solutions = solve(c)

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-5, 5], y: [-2.5, 4.5] }}
        ariaLabel="Graph of a cubic function on the interval from -4 to 4"
        overlay={
          (showX || showC) && (
            <Overlay corner="top-right">
              <ReadoutPanel>
                {showX ? (
                  <>
                    <Readout label="$x$" value={fmt(x)} color={vc.yellow} />
                    <Readout label="$f(x)$" value={fmt(fx)} color={vc.yellow} />
                  </>
                ) : (
                  <>
                    <Readout label="$c$" value={fmt(c)} color={vc.yellow} />
                    <Readout label="solutions" value={solutions.length} color={vc.yellow} />
                  </>
                )}
              </ReadoutPanel>
            </Overlay>
          )
        }
      >
        <Grid />
        <Axes />

        <FunctionPlot f={f} domain={[A, B]} color={vc.blue} opacity={1 - 0.75 * monoOpacity} />
        <g style={{ opacity: monoOpacity }}>
          <FunctionPlot f={f} domain={[A, -2]} color={vc.blue} width={4} />
          <FunctionPlot f={f} domain={[-2, 2]} color={vc.red} width={4} />
          <FunctionPlot f={f} domain={[2, B]} color={vc.blue} width={4} />
          {[-2, 2].map((t) => (
            <Segment key={t} from={[t, 0]} to={[t, f(t)]} color={vc.muted} width={1} dash="3 5" />
          ))}
        </g>
        <g style={{ opacity: monoOpacity }}>
          <TextLabel at={[-3.75, 1.7]} color={vc.blue} align="end">
            increasing
          </TextLabel>
          <TextLabel at={[0.45, 2.1]} color={vc.red} align="start">
            decreasing
          </TextLabel>
          <TextLabel at={[4.15, 1.1]} color={vc.blue} align="start">
            increasing
          </TextLabel>
        </g>

        <Point at={[A, f(A)]} color={vc.blue} r={4.5} />
        <Point at={[B, f(B)]} color={vc.blue} r={4.5} />
        <MathLabel at={[B, f(B)]} tex="f" color={vc.blue} anchor="ne" />

        {/* Extremes: the highest and lowest heights, and the range between them. */}
        <g style={{ opacity: extOpacity }}>
          {[3, -1].map((h) => (
            <Segment
              key={h}
              from={[0, h]}
              to={[1, h]}
              extend
              color={vc.yellow}
              width={1}
              dash="4 6"
              opacity={0.6}
            />
          ))}
          {[-2, 4, 2, -4].map((t) => (
            <Point key={t} at={[t, f(t)]} color={vc.yellow} r={5.5} />
          ))}
          <AxisInterval
            set={[{ from: -1, to: 3, closedFrom: true, closedTo: true }]}
            axis="y"
            color={vc.yellow}
          />
        </g>
        <MathLabel
          at={[-2, 3]}
          tex="\max = 3"
          color={vc.yellow}
          anchor="n"
          offset={12}
          opacity={extOpacity}
        />
        <MathLabel
          at={[2, -1]}
          tex="\min = -1"
          color={vc.yellow}
          anchor="s"
          offset={12}
          opacity={extOpacity}
        />

        {/* Evaluate: up from x, then across to f(x). */}
        <g style={{ opacity: xOpacity }}>
          <Segment from={[x, 0]} to={[x, fx]} color={vc.yellow} width={1.5} dash="4 5" />
          <Vector from={[x, fx]} to={[0, fx]} color={vc.yellow} width={1.5} head={9} />
          <Point at={[x, fx]} color={vc.yellow} r={4.5} />
        </g>
        {showX && (
          <Point at={[x, 0]} color={vc.yellow} r={6.5} onDrag={([v]) => moveX(v)} label="x" />
        )}
        <MathLabel
          at={[x, 0]}
          tex="x"
          color={vc.yellow}
          anchor="s"
          offset={14}
          opacity={xOpacity}
        />

        {/* Solve: the horizontal line at c and its crossings, read down to the x-axis. */}
        <g style={{ opacity: cOpacity }}>
          <Segment from={[0, c]} to={[1, c]} extend color={vc.yellow} width={1.5} dash="4 5" />
          {solutions.map((s) => (
            <g key={s}>
              <Segment
                from={[s, c]}
                to={[s, 0]}
                color={vc.yellow}
                width={1}
                dash="2 4"
                opacity={0.7}
              />
              <Point at={[s, c]} color={vc.yellow} r={4.5} />
              <Point at={[s, 0]} color={vc.yellow} r={3.5} />
            </g>
          ))}
        </g>
        {showC && (
          <Point at={[0, c]} color={vc.yellow} r={6.5} onDrag={([, v]) => moveC(v)} label="c" />
        )}
        <MathLabel
          at={[0, c]}
          tex="c"
          color={vc.yellow}
          anchor="w"
          offset={14}
          opacity={cOpacity}
        />
      </Stage>

      <VizControls>
        {showX && (
          <LabeledSlider
            label="$x$"
            value={x}
            onChange={moveX}
            min={A}
            max={B}
            step={0.01}
            color={vc.yellow}
          />
        )}
        {showC && (
          <LabeledSlider
            label="$c$"
            value={c}
            onChange={moveC}
            min={-2}
            max={4}
            step={0.01}
            color={vc.yellow}
          />
        )}
      </VizControls>
    </>
  )
}
