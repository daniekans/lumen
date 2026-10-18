import { clamp, fmt, lerp, type Vec2 } from '@/lib/math'
import { tex } from '@/lib/practice'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  MathLabel,
  numbersCodec,
  Overlay,
  Point,
  Segment,
  Stage,
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

const { num, signed } = tex

const X_LIM = 4.5
const Y_MIN = -4
const Y_MAX = 5

/** Rounds to the nearest half, the grid points can snap to. */
const half = (v: number) => Math.round(v * 2) / 2

const lineCodec = numbersCodec(['x1', 'y1', 'x2', 'y2'] as const)
const vertexCodec = numbersCodec(['a', 'h', 'k'] as const)
const standardCodec = numbersCodec(['b', 'c'] as const)

/** x - h as TeX: x - 1, x + 2, or x for h = 0. */
const shift = (h: number) => (h === 0 ? 'x' : `x${signed(-h)}`)

/** A coefficient in front of a term: '', '-', '2', '\frac{1}{2}'. */
const coef = (a: number) => (a === 1 ? '' : a === -1 ? '-' : num(a))

/** a(x - h)² + k as TeX. */
const vertexTex = (a: number, h: number, k: number) => {
  const square = h === 0 ? 'x^2' : `(${shift(h)})^2`
  return `${coef(a)}${square}${signed(k)}`
}

/** y = mx + b as TeX. */
const lineTex = (m: number, b: number) =>
  m === 0 ? num(b, 64) : `${m === 1 ? '' : m === -1 ? '-' : num(m, 64)}x${signed(b, 64)}`

export default function LinesAndParabolas() {
  const { id } = useVizStep()
  const [line, setLine] = useVizParam('line', { x1: -2, y1: -1, x2: 2, y2: 1 }, lineCodec)
  const [v, setV] = useVizParam('v', { a: 1, h: 1, k: -2 }, vertexCodec)
  const [s, setS] = useVizParam('bc', { b: -2, c: -1 }, standardCodec)
  const seq = useSequence()

  useStepEffect({
    vertex: () =>
      void seq.run(({ tween }) =>
        tween(0, 1, {
          duration: 1.4,
          onUpdate: (t) => setV({ a: 1, h: lerp(0, 1, t), k: lerp(0, -2, t) }),
        }),
      ),
    complete: () =>
      void seq.run(({ tween }) =>
        tween(0, -2, { duration: 1.2, onUpdate: (b) => setS({ b, c: -1 }) }),
      ),
    zeros: () =>
      void seq.run(({ tween }) =>
        tween(1, -2, {
          duration: 1.6,
          onUpdate: (k) => setV({ a: 1, h: 1, k }),
        }),
      ),
  })

  // Line through P and Q.
  const P: Vec2 = [line.x1, line.y1]
  const Q: Vec2 = [line.x2, line.y2]
  const dx = line.x2 - line.x1
  const dy = line.y2 - line.y1
  const m = dy / dx
  const b = line.y1 - m * line.x1
  const corner: Vec2 = [line.x2, line.y1]

  const movePoint = (which: 'P' | 'Q', [px, py]: Vec2) => {
    const x = half(clamp(px, -X_LIM, X_LIM))
    const y = half(clamp(py, Y_MIN + 0.5, Y_MAX - 0.5))
    const other = which === 'P' ? line.x2 : line.x1
    // Two points with the same x would make a vertical line, which has no slope.
    if (x === other) return
    setLine(which === 'P' ? { ...line, x1: x, y1: y } : { ...line, x2: x, y2: y })
  }

  // Parabola in vertex form.
  const parabola = (x: number) => v.a * (x - v.h) ** 2 + v.k
  const moveVertex = ([px, py]: Vec2) => {
    seq.cancel()
    setV({ ...v, h: half(clamp(px, -3, 3)), k: half(clamp(py, -3.5, 4)) })
  }
  const setA = (a: number) => {
    seq.cancel()
    // a = 0 is a line, not a parabola, so the slider skips it.
    setV({ ...v, a: a === 0 ? (v.a > 0 ? -0.25 : 0.25) : a })
  }
  const ratio = -v.k / v.a
  const d = ratio >= 0 ? Math.sqrt(ratio) : NaN
  const zeros = ratio > 0 ? [v.h - d, v.h + d] : ratio === 0 ? [v.h] : []

  // Standard form x² + bx + c and its vertex.
  const h2 = -s.b / 2
  const k2 = s.c - (s.b * s.b) / 4

  // Readouts round to the steps the controls use (halves for the vertex, whole numbers for b), so
  // the text does not flicker through decimals while a transition animates the curve.
  const vs = { a: v.a, h: half(v.h), k: half(v.k) }
  const ratioShown = -vs.k / vs.a
  const dShown = Math.sqrt(Math.max(ratioShown, 0))
  const bs = Math.round(s.b)
  const h2s = -bs / 2
  const k2s = s.c - (bs * bs) / 4
  const standard = (x: number) => x * x + s.b * x + s.c

  const parabolaStep = id === 'vertex' || id === 'zeros'

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-X_LIM, X_LIM], y: [Y_MIN, Y_MAX] }}
        ariaLabel="A line through two points, and parabolas with their vertex"
        overlay={
          <Overlay corner="top-right">
            {id === 'slope' && (
              <ReadoutPanel title="Line">
                <Readout
                  label="$\Delta x$"
                  value={<Tex>{num(dx)}</Tex>}
                  color={vc.teal}
                  hint="The run: how far $Q$ is to the right of $P$."
                />
                <Readout
                  label="$\Delta y$"
                  value={<Tex>{num(dy)}</Tex>}
                  color={vc.yellow}
                  hint="The rise: how far $Q$ is above $P$."
                />
                <Readout
                  label="slope $m$"
                  value={<Tex>{`\\frac{\\Delta y}{\\Delta x} = ${num(m, 64)}`}</Tex>}
                  hint="The change in $y$ for each step of $1$ in $x$, the same between any two points of the line."
                />
                <Readout
                  label="intercept $b$"
                  value={<Tex>{num(b, 64)}</Tex>}
                  hint="Where the line meets the $y$-axis, the value of $y$ at $x = 0$."
                />
                <Readout label="equation" value={<Tex>{`y = ${lineTex(m, b)}`}</Tex>} />
              </ReadoutPanel>
            )}
            {parabolaStep && (
              <ReadoutPanel title={id === 'vertex' ? 'Parabola' : 'Zeros'}>
                <Readout label="rule" value={<Tex>{`y = ${vertexTex(vs.a, vs.h, vs.k)}`}</Tex>} />
                <Readout
                  label="vertex"
                  value={<Tex>{`(${num(vs.h)}, ${num(vs.k)})`}</Tex>}
                  color={vc.yellow}
                  hint="The lowest point if $a > 0$, the highest if $a < 0$."
                />
                {id === 'vertex' && (
                  <Readout
                    label="axis"
                    value={<Tex>{`x = ${num(vs.h)}`}</Tex>}
                    color={vc.teal}
                    hint="The vertical line through the vertex. The parabola is symmetric about it."
                  />
                )}
                {id === 'zeros' && (
                  <>
                    <Readout
                      label="$-k / a$"
                      value={<Tex>{num(ratioShown)}</Tex>}
                      hint="The square $(x - h)^2$ must equal this. A square is never negative, so a negative value means no zeros."
                    />
                    <Readout
                      label="zeros"
                      value={
                        <Tex>
                          {ratioShown < 0
                            ? '\\text{none}'
                            : ratioShown === 0
                              ? num(vs.h)
                              : `${num(vs.h)} \\pm ${fmt(dShown)}`}
                        </Tex>
                      }
                      color={vc.teal}
                    />
                  </>
                )}
              </ReadoutPanel>
            )}
            {id === 'complete' && (
              <ReadoutPanel title="Completing the square">
                <Readout
                  label="standard"
                  value={<Tex>{`y = x^2${bTerm(bs)}${signed(s.c)}`}</Tex>}
                />
                <Readout
                  label="vertex form"
                  value={<Tex>{`y = ${vertexTex(1, h2s, k2s)}`}</Tex>}
                  hint="Half of $b$ goes inside the square; its square, $\frac{b^2}{4}$, is subtracted to keep the value."
                />
                <Readout
                  label="vertex"
                  value={<Tex>{`(${num(h2s)}, ${num(k2s)})`}</Tex>}
                  color={vc.yellow}
                  hint="$\left(-\frac{b}{2}, c - \frac{b^2}{4}\right)$: where the arrow moves the vertex of $x^2$."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {id === 'slope' && (
          <>
            <Segment from={P} to={Q} extend color={vc.blue} width={2.5} />
            <Segment from={P} to={corner} color={vc.teal} width={2} dash="5 5" />
            <Segment from={corner} to={Q} color={vc.yellow} width={2} dash="5 5" />
            <MathLabel
              at={[(line.x1 + line.x2) / 2, line.y1]}
              tex="\Delta x"
              color={vc.teal}
              anchor={dy >= 0 ? 's' : 'n'}
              offset={8}
            />
            <MathLabel
              at={[line.x2, (line.y1 + line.y2) / 2]}
              tex="\Delta y"
              color={vc.yellow}
              anchor={dx >= 0 ? 'e' : 'w'}
              offset={8}
            />
            <Point at={[0, b]} color={vc.blue} hollow />
            <MathLabel at={[0, b]} tex="b" color={vc.blue} anchor="w" offset={12} />
            <Point at={P} color={vc.blue} label="P" onDrag={(p) => movePoint('P', p)} />
            <Point at={Q} color={vc.blue} label="Q" onDrag={(p) => movePoint('Q', p)} />
            <MathLabel at={P} tex="P" color={vc.blue} anchor="nw" offset={14} />
            <MathLabel at={Q} tex="Q" color={vc.blue} anchor="nw" offset={14} />
          </>
        )}

        {parabolaStep && (
          <>
            <FunctionPlot f={(x) => v.a * x * x} color={vc.muted} width={1.5} dash="4 6" />
            {id === 'vertex' && (
              <Segment
                from={[v.h, 0]}
                to={[v.h, 1]}
                extend
                color={vc.teal}
                width={1.25}
                dash="4 5"
              />
            )}
            <FunctionPlot f={parabola} color={vc.blue} />
            {id === 'zeros' &&
              zeros.map((z) => (
                <g key={z}>
                  <Segment from={[v.h, 0]} to={[z, 0]} color={vc.teal} width={3} />
                  <Point at={[z, 0]} color={vc.teal} />
                </g>
              ))}
            {id === 'zeros' && zeros.length === 2 && (
              <MathLabel
                at={[v.h + d / 2, 0]}
                tex={'\\sqrt{-k/a}'}
                color={vc.teal}
                anchor={v.a > 0 ? 'n' : 's'}
                offset={10}
              />
            )}
            <Point at={[v.h, v.k]} color={vc.yellow} onDrag={moveVertex} />
          </>
        )}

        {id === 'complete' && (
          <>
            <FunctionPlot f={(x) => x * x} color={vc.muted} width={1.5} dash="4 6" />
            <Segment from={[h2, 0]} to={[h2, 1]} extend color={vc.teal} width={1.25} dash="4 5" />
            <FunctionPlot f={standard} color={vc.blue} />
            {Math.hypot(h2, k2) > 0.3 && <Vector to={[h2, k2]} color={vc.yellow} width={2} />}
            <Point at={[h2, k2]} color={vc.yellow} />
          </>
        )}
      </Stage>

      <VizControls>
        {parabolaStep && (
          <LabeledSlider
            label="$a$"
            value={v.a}
            onChange={setA}
            min={-2}
            max={2}
            step={0.25}
            format={(x) => fmt(x)}
            color={vc.blue}
          />
        )}
        {id === 'complete' && (
          <>
            <LabeledSlider
              label="$b$"
              value={s.b}
              onChange={(b) => {
                seq.cancel()
                setS({ ...s, b })
              }}
              min={-4}
              max={4}
              step={1}
              format={(x) => fmt(x, 0)}
              color={vc.blue}
            />
            <LabeledSlider
              label="$c$"
              value={s.c}
              onChange={(c) => {
                seq.cancel()
                setS({ ...s, c })
              }}
              min={-3}
              max={3}
              step={0.5}
              format={(x) => fmt(x, 1)}
              color={vc.blue}
            />
          </>
        )}
      </VizControls>
    </>
  )
}

/** + bx as TeX, or '' for b = 0. */
const bTerm = (b: number) => (b === 0 ? '' : `${b < 0 ? ' - ' : ' + '}${coef(Math.abs(b))}x`)
