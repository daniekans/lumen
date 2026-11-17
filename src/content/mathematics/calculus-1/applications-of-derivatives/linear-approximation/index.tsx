import { useState } from 'react'
import { clamp, fmt, zoomedStep, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  HoverGroup,
  MathLabel,
  Overlay,
  Path,
  Point,
  Segment,
  Stage,
  useHighlight,
  useSequence,
  useStepEffect,
  useStepStart,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const f = (x: number) => (x < 0 ? NaN : Math.sqrt(x))
const df = (x: number) => 1 / (2 * Math.sqrt(x))
/** f''(a) / 2 for the square root: f''(x) = -1 / (4 x^(3/2)). */
const halfCurvature = (x: number) => -1 / (8 * x ** 1.5)

const A_MIN = 0.5
const A_MAX = 8
const DX_MIN = 0.001
/** The unzoomed view. Zooming scales it around A. */
const VIEW = { x: [-0.6, 9.4], y: [-0.7, 3.9] } as const

/** The disk of the last step: radius in cm, and stage units per cm. */
const R_CM = 10
const K = 0.24
const circle = (r: number, n = 120): Vec2[] =>
  Array.from({ length: n }, (_, i) => {
    const t = (2 * Math.PI * i) / n
    return [r * Math.cos(t), r * Math.sin(t)]
  })

type Graph = 'fit' | 'differentials' | 'estimate' | 'error' | 'best'

export default function LinearApproximation() {
  const { id } = useVizStep()
  const [a, setA] = useState(4)
  const [dx, setDx] = useState(2.5)
  // Magnification around A, as a power of ten. In 'error' and 'best' it follows dx instead.
  const [s, setS] = useState(0)
  const [m, setM] = useState(0.55)
  const [dr, setDr] = useState(1)
  const seq = useSequence()
  const hl = useHighlight()
  const start = useStepStart({ a, dx, s, dr })

  const toA4 = (from: number) => (from === 4 ? undefined : { from, to: 4 })

  /** dx from its start down to 0.01 on a log scale, so each factor of ten takes the same time. */
  const shrinkDx = (from: number) =>
    void seq.run(({ tween }) =>
      tween(Math.log10(Math.max(from, 0.01)), -2, {
        duration: 4,
        onUpdate: (u) => setDx(10 ** u),
      }),
    )

  useStepEffect({
    fit: (run) => {
      const from = run.replay ? { ...start(run), s: 0 } : start(run)
      const back = toA4(from.a)
      void seq.run(({ tween }) =>
        Promise.all([
          back && tween(back.from, back.to, { duration: 0.8, onUpdate: setA }),
          tween(from.s, 1.6, { duration: 2.6, onUpdate: setS }),
        ]).then(() => undefined),
      )
    },
    differentials: (run) => {
      const from = start(run)
      void seq.run(({ tween }) =>
        Promise.all([
          tween(from.s, 0, { duration: 1, onUpdate: setS }),
          tween(run.replay ? 0 : from.dx, 2.5, { duration: 1.6, onUpdate: setDx }),
        ]).then(() => undefined),
      )
    },
    estimate: (run) => {
      const from = run.replay ? { ...start(run), s: 0 } : start(run)
      const back = toA4(from.a)
      void seq.run(({ tween }) =>
        Promise.all([
          back && tween(back.from, back.to, { duration: 0.8, onUpdate: setA }),
          tween(from.dx, 0.1, { duration: 1.2, onUpdate: setDx }),
          tween(from.s, 1.3, { duration: 2.4, onUpdate: setS }),
        ]).then(() => undefined),
      )
    },
    error: (run) => shrinkDx(run.replay ? 2 : Math.max(start(run).dx, 0.5)),
    best: () => shrinkDx(2),
    ring: (run) =>
      void seq.run(({ tween }) =>
        tween(run.replay ? 0 : start(run).dr, 1, { duration: 1.2, onUpdate: setDr }),
      ),
  })

  const moveA = (v: number) => {
    seq.cancel()
    setA(clamp(v, A_MIN, A_MAX))
  }
  const moveDx = (v: number) => {
    seq.cancel()
    setDx(clamp(v, DX_MIN - a, 9 - a))
  }
  const moveM = (v: number) => {
    seq.cancel()
    setM(v)
  }
  const moveDr = (v: number) => {
    seq.cancel()
    setDr(v)
  }

  const graph = id !== 'ring'
  const follows = id === 'error' || id === 'best'
  const showDx = id !== 'fit'

  const slope = df(a)
  const A: Vec2 = [a, f(a)]
  const x1 = a + dx
  const Q: Vec2 = [x1, f(x1)]
  const dy = slope * dx
  const T: Vec2 = [x1, A[1] + dy]
  const deltaY = Q[1] - A[1]
  const err = deltaY - dy
  const other = A[1] + m * dx
  const errOther = deltaY - m * dx

  const z = follows ? Math.max(1, 1.6 / Math.abs(dx)) : 10 ** s
  const zoomed = (v: readonly [number, number], c: number) =>
    [c + (v[0] - c) / z, c + (v[1] - c) / z] as const
  const domain = graph
    ? { x: zoomed(VIEW.x, A[0]), y: zoomed(VIEW.y, A[1]) }
    : { x: [-4.6, 4.6] as const, y: [-3.2, 3.2] as const }
  const gridStep = zoomedStep(1, z)
  // Label offsets in pixels stay put while the view zooms, so labels are placed at midpoints.
  const mid = (p: Vec2, q: Vec2): Vec2 => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
  const tangentReach = (VIEW.x[1] - VIEW.x[0]) / z

  const rIn = R_CM * K
  const rOut = (R_CM + dr) * K
  const ring: Vec2[] = [
    ...circle(rOut),
    circle(rOut)[0]!,
    circle(rIn)[0]!,
    ...circle(rIn).reverse(),
  ]
  const area = Math.PI * R_CM ** 2
  const deltaA = Math.PI * ((R_CM + dr) ** 2 - R_CM ** 2)
  const dA = 2 * Math.PI * R_CM * dr

  const graphReadouts = (step: Graph) => (
    <ReadoutPanel>
      <Readout label="$a$" value={fmt(a)} color={vc.blue} />
      {step === 'fit' && (
        <>
          <Readout label="$f(a)$" value={fmt(f(a), 3)} color={vc.blue} hint="$f(x) = \sqrt{x}$" />
          <Readout
            label="$f'(a)$"
            value={fmt(slope, 3)}
            color={vc.teal}
            hint="$f'(x) = \frac{1}{2\sqrt{x}}$"
            {...hl.bind('L')}
          />
          <Readout label="zoom" value={`×${fmt(10 ** s, 0)}`} />
        </>
      )}
      {showDx && <Readout label="$dx$" value={fmt(dx, 4)} color={vc.yellow} {...hl.bind('dx')} />}
      {(step === 'differentials' || step === 'estimate') && (
        <>
          <Readout label="$dy = f'(a)\,dx$" value={fmt(dy, 5)} color={vc.teal} {...hl.bind('dy')} />
          <Readout
            label="$\Delta y$"
            value={fmt(deltaY, 5)}
            color={vc.orange}
            hint="$f(a + dx) - f(a)$"
            {...hl.bind('Dy')}
          />
          <Readout label="error $\Delta y - dy$" value={fmt(err, 6)} color={vc.red} />
        </>
      )}
      {step === 'estimate' && (
        <>
          <Readout label="$L(4.1)$" value={fmt(A[1] + dy, 5)} color={vc.teal} />
          <Readout label="$\sqrt{4.1}$" value={fmt(Q[1], 5)} color={vc.blue} />
        </>
      )}
      {step === 'error' && (
        <>
          <Readout label="error" value={fmt(err, 7)} color={vc.red} hint="$\Delta y - dy$" />
          <Readout label="$\frac{\text{error}}{dx}$" value={fmt(err / dx, 5)} color={vc.red} />
          <Readout
            label="$\frac{\text{error}}{dx^2}$"
            value={fmt(err / (dx * dx), 5)}
            color={vc.red}
            hint={`Tends to $\\frac{f''(a)}{2} = ${fmt(halfCurvature(a), 5)}$ as $dx \\to 0$.`}
          />
        </>
      )}
      {step === 'best' && (
        <>
          <Readout
            label="tangent: $\frac{\text{error}}{dx}$"
            value={fmt(err / dx, 5)}
            color={vc.teal}
            {...hl.bind('L')}
          />
          <Readout
            label="slope $m$: $\frac{\text{error}}{dx}$"
            value={fmt(errOther / dx, 5)}
            color={vc.purple}
            hint={`Tends to $f'(a) - m = ${fmt(slope - m, 3)}$.`}
            {...hl.bind('m')}
          />
        </>
      )}
    </ReadoutPanel>
  )

  return (
    <>
      <Stage
        zoomable={graph}
        highlight={hl}
        domain={domain}
        ariaLabel={
          graph
            ? 'Graph of the square root with its tangent line at a, and the changes dx, dy and delta y'
            : 'A disk of radius r with a thin ring of width dr around it'
        }
        overlay={
          <Overlay corner="top-left">
            {graph ? (
              graphReadouts(id as Graph)
            ) : (
              <ReadoutPanel>
                <Readout label="$r$" value="10 cm" color={vc.blue} />
                <Readout label="$dr$" value={`${fmt(dr, 2)} cm`} color={vc.yellow} />
                <Readout label="$A = \pi r^2$" value={`${fmt(area, 1)} cm²`} color={vc.blue} />
                <Readout
                  label="$\Delta A$"
                  value={`${fmt(deltaA, 2)} cm²`}
                  color={vc.orange}
                  hint="The ring: $\pi(r + dr)^2 - \pi r^2$."
                />
                <Readout label="$dA = 2\pi r\,dr$" value={`${fmt(dA, 2)} cm²`} color={vc.teal} />
                <Readout
                  label="$\Delta A - dA = \pi\,dr^2$"
                  value={`${fmt(deltaA - dA, 3)} cm²`}
                  color={vc.red}
                />
                <Readout
                  label="$\frac{dA}{A} = 2\,\frac{dr}{r}$"
                  value={`${fmt((100 * dA) / area, 1)}%`}
                  hint="The relative error of the area is twice that of the radius."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        {graph && (
          <>
            <Grid step={gridStep} />
            <Axes step={gridStep} />
            <HoverGroup hoverKey="L">
              <Segment
                from={[a - tangentReach, A[1] - slope * tangentReach]}
                to={[a + tangentReach, A[1] + slope * tangentReach]}
                color={vc.teal}
                width={2}
              />
            </HoverGroup>
            {id === 'best' && (
              <HoverGroup hoverKey="m">
                <Segment
                  from={[a - tangentReach, A[1] - m * tangentReach]}
                  to={[a + tangentReach, A[1] + m * tangentReach]}
                  color={vc.purple}
                  width={2}
                />
                <Point at={[x1, other]} color={vc.purple} r={4.5} coords={false} />
              </HoverGroup>
            )}
            <FunctionPlot f={f} domain={[0, 12]} color={vc.blue} samples={600} />
            {id === 'fit' && (
              <MathLabel
                at={[a + 1.6 / z, A[1] + (1.6 * slope) / z]}
                tex="L"
                color={vc.teal}
                anchor="se"
              />
            )}
            {showDx && (
              <>
                <HoverGroup hoverKey="dx">
                  <Segment from={A} to={[x1, A[1]]} color={vc.yellow} width={2.5} />
                  <MathLabel at={mid(A, [x1, A[1]])} tex="dx" color={vc.yellow} anchor="s" />
                </HoverGroup>
                <HoverGroup hoverKey="dy">
                  <Segment from={[x1, A[1]]} to={T} color={vc.teal} width={3} />
                  {!follows && (
                    <MathLabel
                      at={mid([x1, A[1]], T)}
                      tex="dy"
                      color={vc.teal}
                      anchor={dx > 0 ? 'e' : 'w'}
                    />
                  )}
                </HoverGroup>
                <HoverGroup hoverKey="Dy">
                  <Segment
                    from={[x1 + ((dx > 0 ? 1 : -1) * 0.012 * (VIEW.x[1] - VIEW.x[0])) / z, A[1]]}
                    to={[x1 + ((dx > 0 ? 1 : -1) * 0.012 * (VIEW.x[1] - VIEW.x[0])) / z, Q[1]]}
                    color={vc.orange}
                    width={2}
                  />
                  {!follows && id !== 'estimate' && (
                    <MathLabel
                      at={mid([x1, A[1]], Q)}
                      tex="\Delta y"
                      color={vc.orange}
                      anchor={dx > 0 ? 'w' : 'e'}
                      offset={14}
                    />
                  )}
                </HoverGroup>
                <Segment from={T} to={Q} color={vc.red} width={3.5} />
                <Point at={T} color={vc.teal} r={4} coords={false} />
                <Point at={Q} color={vc.orange} r={4.5} />
              </>
            )}
            <Point
              at={A}
              color={vc.blue}
              r={6}
              onDrag={id === 'estimate' ? undefined : ([px]) => moveA(px)}
            />
            <MathLabel at={A} tex="A" color={vc.blue} anchor="nw" offset={12} />
          </>
        )}

        {!graph && (
          <>
            <Path points={ring} closed fill={vc.orange} fillOpacity={0.45} width={0} />
            <Path points={circle(rIn)} closed fill={vc.blue} fillOpacity={0.16} color={vc.blue} />
            <Path points={circle(rOut)} closed color={vc.orange} width={1.5} />
            <Segment from={[0, 0]} to={[rIn, 0]} color={vc.blue} width={2} />
            <MathLabel at={[rIn / 2, 0]} tex="r" color={vc.blue} anchor="n" />
            <Segment from={[rIn, 0]} to={[rOut, 0]} color={vc.yellow} width={3} />
            <MathLabel at={[rOut, 0]} tex="dr" color={vc.yellow} anchor="e" offset={8} />
            <MathLabel
              at={[0, -rIn]}
              tex="\text{circumference } 2\pi r"
              color={vc.teal}
              anchor="n"
              offset={14}
            />
            <Point at={[0, 0]} color={vc.blue} r={3.5} coords={false} />
          </>
        )}
      </Stage>

      <VizControls>
        {graph && id !== 'estimate' && (
          <LabeledSlider
            label="$a$"
            value={a}
            onChange={moveA}
            min={A_MIN}
            max={A_MAX}
            step={0.01}
            color={vc.blue}
          />
        )}
        {(id === 'differentials' || follows) && (
          <LabeledSlider
            label="$dx$"
            value={dx}
            onChange={moveDx}
            min={follows ? 0.01 : -a + DX_MIN}
            max={follows ? 2 : 9 - a}
            step={0.01}
            color={vc.yellow}
            format={(v) => fmt(v, 3)}
          />
        )}
        {id === 'best' && (
          <LabeledSlider
            label="$m$"
            value={m}
            onChange={moveM}
            min={-0.5}
            max={1}
            step={0.01}
            color={vc.purple}
          />
        )}
        {id === 'ring' && (
          <LabeledSlider
            label="$dr$ (cm)"
            value={dr}
            onChange={moveDr}
            min={0}
            max={2}
            step={0.01}
            color={vc.yellow}
          />
        )}
      </VizControls>
    </>
  )
}
