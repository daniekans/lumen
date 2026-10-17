import { useState } from 'react'
import { clamp, fmt, inIntervals, intervalTex, type Interval, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
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
  useAnimatedValue,
  useStepEffect,
  useVizStep,
  VizControls,
} from '@/viz-kit'

interface Case {
  label: string
  tex: string
  f: (x: number) => number
  domain: readonly Interval[]
  range: readonly Interval[]
  /** All solutions of f(x) = c. */
  solve: (c: number) => number[]
  /** Endpoints of the graph, drawn filled (closed) or hollow (open). */
  ends?: readonly { at: Vec2; closed: boolean }[]
  /** Dashed lines the graph approaches: x = a and y = b. */
  asymptotes?: { x: number; y: number }
}

const R = Infinity
const cases = {
  root: {
    label: '√(x + 2)',
    tex: 'f(x) = \\sqrt{x + 2}',
    f: (x) => Math.sqrt(x + 2),
    domain: [{ from: -2, to: R, closedFrom: true }],
    range: [{ from: 0, to: R, closedFrom: true }],
    solve: (c) => (c >= 0 ? [c * c - 2] : []),
    ends: [{ at: [-2, 0], closed: true }],
  },
  reciprocal: {
    label: '1/(x − 1) + 1',
    tex: 'f(x) = \\dfrac{1}{x - 1} + 1',
    f: (x) => 1 / (x - 1) + 1,
    domain: [
      { from: -R, to: 1 },
      { from: 1, to: R },
    ],
    range: [
      { from: -R, to: 1 },
      { from: 1, to: R },
    ],
    solve: (c) => (c === 1 ? [] : [1 + 1 / (c - 1)]),
    asymptotes: { x: 1, y: 1 },
  },
  square: {
    label: 'x² − 3',
    tex: 'f(x) = x^2 - 3',
    f: (x) => x * x - 3,
    domain: [{ from: -R, to: R }],
    range: [{ from: -3, to: R, closedFrom: true }],
    solve: (c) => (c < -3 ? [] : c === -3 ? [0] : [-Math.sqrt(c + 3), Math.sqrt(c + 3)]),
  },
  restricted: {
    label: '3 − x/2 on [−2, 4)',
    tex: 'f(x) = 3 - \\dfrac{x}{2},\\ -2 \\leq x < 4',
    f: (x) => 3 - x / 2,
    domain: [{ from: -2, to: 4, closedFrom: true }],
    range: [{ from: 1, to: 4, closedTo: true }],
    solve: (c) => {
      const x = 2 * (3 - c)
      return x >= -2 && x < 4 ? [x] : []
    },
    ends: [
      { at: [-2, 4], closed: true },
      { at: [4, 1], closed: false },
    ],
  },
} satisfies Record<string, Case>

type CaseId = keyof typeof cases
const X_VIEW: [number, number] = [-5.5, 5.5]
const Y_VIEW: [number, number] = [-4, 5.5]
/** Graph pieces: the domain clipped to a range a little wider than the view. */
const pieces = (domain: readonly Interval[]) =>
  domain.map((i) => {
    const gap = Number.isFinite(i.from) && !i.closedFrom ? 1e-3 : 0
    const gapTo = Number.isFinite(i.to) && !i.closedTo ? 1e-3 : 0
    return [Math.max(i.from, -8) + gap, Math.min(i.to, 8) - gapTo] as const
  })

export default function DomainAndRange() {
  const { id } = useVizStep()
  const [caseId, setCaseId] = useState<CaseId>('root')
  const [x, setRawX] = useState(1)
  const [c, setRawC] = useState(1.5)
  // Rounded to hundredths, so probes can land exactly on a boundary such as x = 1.
  const setX = (v: number) => setRawX(Math.round(clamp(v, -5, 5) * 100) / 100)
  const setC = (v: number) => setRawC(Math.round(clamp(v, -3.8, 5.2) * 100) / 100)
  const k: Case = cases[caseId]

  const showX = id !== 'range' && id !== 'parabola'
  const showC = id !== 'domain'
  const xOpacity = useAnimatedValue(showX ? 1 : 0, { duration: 0.5 })
  const cOpacity = useAnimatedValue(showC ? 1 : 0, { duration: 0.5 })

  useStepEffect({
    domain: () => {
      setCaseId('root')
      setX(1)
    },
    range: () => {
      setCaseId('root')
      setC(1.5)
    },
    gap: () => {
      setCaseId('reciprocal')
      setX(2.5)
      setC(2.5)
    },
    parabola: () => {
      setCaseId('square')
      setC(1)
    },
    restricted: () => {
      setCaseId('restricted')
      setX(1)
      setC(2)
    },
  })

  const defined = inIntervals(k.domain, x)
  const fx = defined ? k.f(x) : NaN
  const solutions = k.solve(c)

  return (
    <>
      <Stage
        zoomable
        domain={{ x: X_VIEW, y: Y_VIEW }}
        ariaLabel="Graph of a function with its domain on the x-axis and its range on the y-axis"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout
                label="domain"
                value={<Tex>{intervalTex(k.domain)}</Tex>}
                color={vc.yellow}
              />
              {showC && (
                <Readout label="range" value={<Tex>{intervalTex(k.range)}</Tex>} color={vc.teal} />
              )}
              {showX && (
                <Readout label="$f(x)$" value={defined ? fmt(fx) : 'undefined'} color={vc.yellow} />
              )}
              {showC && (
                <Readout label="solutions of $f(x) = c$" value={solutions.length} color={vc.teal} />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {k.asymptotes && (
          <>
            <Segment
              from={[k.asymptotes.x, 0]}
              to={[k.asymptotes.x, 1]}
              extend
              color={vc.muted}
              width={1.25}
              dash="5 6"
            />
            <Segment
              from={[0, k.asymptotes.y]}
              to={[1, k.asymptotes.y]}
              extend
              color={vc.muted}
              width={1.25}
              dash="5 6"
            />
          </>
        )}

        <AxisInterval set={k.domain} axis="x" color={vc.yellow} />
        <AxisInterval set={k.range} axis="y" color={vc.teal} opacity={cOpacity} />

        {pieces(k.domain).map(([a, b]) => (
          <FunctionPlot key={`${caseId}${a}`} f={k.f} domain={[a, b]} color={vc.blue} />
        ))}
        {k.ends?.map((e) => (
          <Point key={`${caseId}${e.at[0]}`} at={e.at} color={vc.blue} r={5} hollow={!e.closed} />
        ))}
        <MathLabel
          at={[X_VIEW[0] + 0.3, Y_VIEW[1] - 0.2]}
          tex={k.tex}
          color={vc.blue}
          anchor="se"
        />

        {/* Vertical probe: is x in the domain? */}
        <g style={{ opacity: xOpacity }}>
          <Segment
            from={[x, 0]}
            to={[x, 1]}
            extend
            color={vc.yellow}
            width={1.25}
            dash="4 6"
            opacity={defined ? 0.5 : 0.9}
          />
          {defined && <Point at={[x, fx]} color={vc.yellow} r={5} />}
        </g>
        {showX && (
          <Point at={[x, 0]} color={vc.yellow} r={6.5} onDrag={([v]) => setX(v)} label="x" />
        )}
        <MathLabel
          at={[x, 0]}
          tex="x"
          color={vc.yellow}
          anchor="s"
          offset={14}
          opacity={xOpacity}
        />

        {/* Horizontal probe: is c in the range? */}
        <g style={{ opacity: cOpacity }}>
          <Segment
            from={[0, c]}
            to={[1, c]}
            extend
            color={vc.teal}
            width={1.25}
            dash="4 6"
            opacity={solutions.length ? 0.5 : 0.9}
          />
          {solutions.map((s) => (
            <Point key={s} at={[s, c]} color={vc.teal} r={5} />
          ))}
        </g>
        {showC && (
          <Point at={[0, c]} color={vc.teal} r={6.5} onDrag={([, v]) => setC(v)} label="c" />
        )}
        <MathLabel at={[0, c]} tex="c" color={vc.teal} anchor="w" offset={14} opacity={cOpacity} />
      </Stage>

      <VizControls>
        <SegmentedControl
          label="Function"
          value={caseId}
          onChange={setCaseId}
          options={(Object.keys(cases) as CaseId[]).map((v) => ({
            value: v,
            label: cases[v].label,
          }))}
        />
        {showX && (
          <LabeledSlider
            label="$x$"
            value={x}
            onChange={setX}
            min={-5}
            max={5}
            step={0.01}
            color={vc.yellow}
          />
        )}
        {showC && (
          <LabeledSlider
            label="$c$"
            value={c}
            onChange={setC}
            min={-3.8}
            max={5.2}
            step={0.01}
            color={vc.teal}
          />
        )}
      </VizControls>
    </>
  )
}
