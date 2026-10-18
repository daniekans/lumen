import { useState } from 'react'
import { clamp, fmt, lerp, linspace, logBase, type Vec2 } from '@/lib/math'
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
  Path,
  Point,
  Segment,
  Stage,
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const X_MIN = -4
const X_MAX = 6
const Y_MIN = -4
const Y_MAX = 5

const uvCodec = numbersCodec(['u', 'v'] as const)

/** A short decimal for TeX: 2, 2.5, 10. */
const dec = (v: number) => String(+v.toFixed(2))

/** Rounds to the slider step of b, so readouts do not flicker during a transition. */
const tenth = (v: number) => Math.round(v * 10) / 10

/** Inputs of y = b^x sampled for the reflection, kept where both curves stay near the view. */
const REFLECT_XS = linspace(X_MIN, 2.7, 160)

export default function Logarithms() {
  const { id } = useVizStep()
  const [b, setB] = useVizParam<number>('b', 2)
  const [c, setC] = useVizParam<number>('c', 3)
  const [uv, setUv] = useVizParam('uv', { u: 2, v: 2.5 }, uvCodec)
  const [t, setT] = useState(1)
  const [px, setPx] = useState(0.5)
  const seq = useSequence()

  const cancelThen =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      seq.cancel()
      set(v)
    }

  useStepEffect({
    inverse: () => {
      setB(2)
      void seq.run(async ({ tween, wait }) => {
        setT(0)
        await wait(0.4)
        await tween(0, 1, { duration: 2, onUpdate: setT })
      })
    },
    'what-power': () => setPx(0.5),
    'product-rule': () => setUv({ u: 2, v: 2.5 }),
    'change-of-base': () =>
      void seq.run(({ tween }) => tween(b, 10, { duration: 1.6, onUpdate: setB })),
    solving: () => {
      setB(2)
      void seq.run(({ tween }) => tween(1, 3, { duration: 1.4, onUpdate: setC }))
    },
  })

  const bs = tenth(b)
  const log = (x: number) => logBase(b, x)
  const exp = (x: number) => b ** x

  // Reflection: each point (x, b^x) moves straight to its mirror image (b^x, x).
  const reflected: Vec2[] = REFLECT_XS.map((x) => [lerp(x, exp(x), t), lerp(exp(x), x, t)])

  const P: Vec2 = [px, log(px)]
  const moveP = ([x]: Vec2) => setPx(Math.round(clamp(x, 0.1, X_MAX) * 20) / 20)

  const { u, v } = uv
  const w = u * v
  const moveU = ([x]: Vec2) => {
    const nu = Math.round(clamp(x, 0.25, 5) * 4) / 4
    setUv({ u: nu, v: Math.min(v, X_MAX / nu) })
  }
  const moveV = ([x]: Vec2) => {
    const nv = Math.round(clamp(x, 0.25, 5) * 4) / 4
    setUv({ u: Math.min(u, X_MAX / nv), v: nv })
  }

  const cs = tenth(c)
  const root = c > 0 ? log(c) : NaN

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [X_MIN, X_MAX], y: [Y_MIN, Y_MAX] }}
        ariaLabel="Exponential and logarithm curves"
        overlay={
          <Overlay corner="top-right">
            {id === 'inverse' && (
              <ReadoutPanel title="Inverse">
                <Readout label="exponential" value={<Tex>{'y = 2^x'}</Tex>} color={vc.blue} />
                <Readout label="logarithm" value={<Tex>{'y = \\log_2 x'}</Tex>} color={vc.teal} />
                <Readout
                  label="swap"
                  value={<Tex>{'(2, 4) \\to (4, 2)'}</Tex>}
                  hint="Reflection across $y = x$ swaps the coordinates of every point."
                />
              </ReadoutPanel>
            )}
            {id === 'what-power' && (
              <ReadoutPanel title="What power">
                <Readout label="$x$" value={fmt(px)} />
                <Readout label={`$\\log_{${dec(bs)}} x$`} value={fmt(P[1])} color={vc.teal} />
                <Readout
                  label="check"
                  value={<Tex>{`${dec(bs)}^{${fmt(P[1])}} \\approx ${fmt(bs ** P[1])}`}</Tex>}
                  hint="Raising $b$ to the logarithm gives back $x$."
                />
              </ReadoutPanel>
            )}
            {id === 'product-rule' && (
              <ReadoutPanel title="Product rule">
                <Readout label={`$\\log_{${dec(bs)}} u$`} value={fmt(log(u))} color={vc.teal} />
                <Readout label={`$\\log_{${dec(bs)}} v$`} value={fmt(log(v))} color={vc.yellow} />
                <Readout
                  label={`$\\log_{${dec(bs)}} uv$`}
                  value={`${fmt(log(w))}`}
                  color={vc.blue}
                  hint="The sum of the two heights: multiplying inputs adds logarithms."
                />
                <Readout
                  label="$uv$"
                  value={<Tex>{`${dec(u)} \\cdot ${dec(v)} = ${dec(w)}`}</Tex>}
                />
              </ReadoutPanel>
            )}
            {id === 'change-of-base' && (
              <ReadoutPanel title="Change of base">
                <Readout
                  label="curve"
                  value={<Tex>{`\\log_{${dec(bs)}} x = \\frac{\\ln x}{\\ln ${dec(bs)}}`}</Tex>}
                  color={vc.teal}
                />
                <Readout
                  label="scale"
                  value={
                    <Tex>{`\\frac{1}{\\ln ${dec(bs)}} \\approx ${fmt(1 / Math.log(bs), 3)}`}</Tex>
                  }
                  hint="Every height of $\ln x$ is multiplied by this factor."
                />
              </ReadoutPanel>
            )}
            {id === 'solving' && (
              <ReadoutPanel title="Solve">
                <Readout
                  label="equation"
                  value={<Tex>{`${dec(bs)}^x = ${dec(cs)}`}</Tex>}
                  color={vc.yellow}
                />
                <Readout
                  label="$x$"
                  value={
                    cs > 0 ? (
                      <Tex>{`\\log_{${dec(bs)}} ${dec(cs)} \\approx ${fmt(logBase(bs, cs))}`}</Tex>
                    ) : (
                      'no solution'
                    )
                  }
                  color={vc.teal}
                  hint="$b^x$ is always positive, so a height $c \leq 0$ is never reached."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {id === 'inverse' && (
          <>
            <Segment from={[0, 0]} to={[1, 1]} extend color={vc.yellow} width={1.25} dash="4 6" />
            <FunctionPlot f={exp} color={vc.blue} />
            <Path points={reflected} color={vc.teal} width={2.5} />
            <Point at={[2, 4]} color={vc.blue} r={4.5} />
            <Point at={[lerp(2, 4, t), lerp(4, 2, t)]} color={vc.teal} r={4.5} />
          </>
        )}

        {id === 'what-power' && (
          <>
            <FunctionPlot f={log} domain={[0.005, X_MAX + 20]} color={vc.teal} />
            <Segment from={[px, 0]} to={P} color={vc.yellow} width={2} dash="5 5" />
            <Point at={[1, 0]} color={vc.teal} r={4} />
            <MathLabel at={[1, 0]} tex="(1, 0)" color={vc.teal} anchor="se" offset={8} />
            {b < X_MAX && (
              <>
                <Point at={[b, 1]} color={vc.teal} r={4} />
                <MathLabel at={[b, 1]} tex="(b, 1)" color={vc.teal} anchor="se" offset={8} />
              </>
            )}
            <Point at={P} color={vc.blue} label="P" onDrag={moveP} />
            <MathLabel at={P} tex="P" color={vc.blue} anchor="nw" offset={14} />
          </>
        )}

        {id === 'product-rule' && (
          <>
            <FunctionPlot f={log} domain={[0.005, X_MAX + 20]} color={vc.blue} />
            <Segment from={[u, 0]} to={[u, log(u)]} color={vc.teal} width={3} />
            <Segment from={[v, 0]} to={[v, log(v)]} color={vc.yellow} width={3} />
            <Segment from={[w, 0]} to={[w, log(u)]} color={vc.teal} width={3} />
            <Segment from={[w, log(u)]} to={[w, log(w)]} color={vc.yellow} width={3} />
            <Point at={[w, log(w)]} color={vc.blue} r={4.5} />
            <MathLabel
              at={[w, 0]}
              tex="uv"
              color={vc.blue}
              anchor={log(w) >= 0 ? 's' : 'n'}
              offset={12}
            />
            <Point at={[u, 0]} color={vc.teal} label="u" onDrag={moveU} coords={false} />
            <Point at={[v, 0]} color={vc.yellow} label="v" onDrag={moveV} coords={false} />
            <MathLabel
              at={[u, 0]}
              tex="u"
              color={vc.teal}
              anchor={log(u) >= 0 ? 's' : 'n'}
              offset={12}
            />
            <MathLabel
              at={[v, 0]}
              tex="v"
              color={vc.yellow}
              anchor={log(v) >= 0 ? 's' : 'n'}
              offset={12}
            />
          </>
        )}

        {id === 'change-of-base' && (
          <>
            <FunctionPlot
              f={Math.log}
              domain={[0.005, X_MAX + 20]}
              color={vc.muted}
              width={1.75}
              dash="5 6"
            />
            <FunctionPlot f={log} domain={[0.005, X_MAX + 20]} color={vc.teal} />
            <MathLabel at={[5, Math.log(5)]} tex="\ln x" color={vc.muted} anchor="n" offset={10} />
          </>
        )}

        {id === 'solving' && (
          <>
            <FunctionPlot f={exp} color={vc.blue} />
            <Segment from={[0, c]} to={[1, c]} extend color={vc.yellow} width={2} />
            {c > 0 && (
              <>
                <Segment from={[root, 0]} to={[root, c]} color={vc.teal} width={2} dash="5 5" />
                <Point at={[root, c]} color={vc.yellow} r={4.5} />
                <Point at={[root, 0]} color={vc.teal} />
                <MathLabel at={[root, 0]} tex="\log_b c" color={vc.teal} anchor="s" offset={10} />
              </>
            )}
          </>
        )}
      </Stage>

      <VizControls>
        {(id === 'what-power' ||
          id === 'product-rule' ||
          id === 'change-of-base' ||
          id === 'solving') && (
          <LabeledSlider
            label="$b$"
            value={b}
            onChange={cancelThen(setB)}
            min={1.2}
            max={10}
            step={0.1}
            format={(x) => fmt(x, 1)}
            color={vc.teal}
          />
        )}
        {id === 'solving' && (
          <LabeledSlider
            label="$c$"
            value={c}
            onChange={cancelThen(setC)}
            min={-1}
            max={5}
            step={0.1}
            format={(x) => fmt(x, 1)}
            color={vc.yellow}
          />
        )}
      </VizControls>
    </>
  )
}
