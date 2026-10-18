import { useState } from 'react'
import { clamp, fmt, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Arc,
  Axes,
  FunctionPlot,
  Grid,
  MathLabel,
  Overlay,
  Path,
  Point,
  Segment,
  Stage,
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  type ParamCodec,
  VizControls,
} from '@/viz-kit'

const wiggle = (x: number) => (x === 0 ? NaN : x * Math.sin(1 / x))
const sinc = (x: number) => (x === 0 ? NaN : Math.sin(x) / x)
const compound = (t: number) => (t === 0 ? NaN : (1 + t) ** (1 / t))

type Base = '2' | 'e' | '3'
const BASES: Record<Base, { b: number; tex: string; ln: string }> = {
  '2': { b: 2, tex: '2', ln: '\\ln 2 \\approx 0.693' },
  e: { b: Math.E, tex: 'e', ln: '\\ln e = 1' },
  '3': { b: 3, tex: '3', ln: '\\ln 3 \\approx 1.099' },
}
const baseCodec: ParamCodec<Base> = {
  encode: (v) => v,
  decode: (t) => (t === '2' || t === 'e' || t === '3' ? t : undefined),
}

const MAX_ANGLE = 1.1
const MAX_N = 50

const DOMAINS = {
  squeeze: { x: [-1.3, 1.3], y: [-1, 1] },
  areas: { x: [-0.3, 1.5], y: [-0.25, 2.05] },
  'sin-over-x': { x: [-2.2, 2.2], y: [-0.4, 1.4] },
  exponential: { x: [-2, 2.5], y: [-0.5, 4] },
  compound: { x: [-0.7, 1.2], y: [1.6, 4.2] },
} as const

export default function SqueezeAndStandardLimits() {
  const { id } = useVizStep()
  const [base, setBase] = useVizParam<Base>('b', 'e', baseCodec)
  // Distance from 0 as a power of ten (d = 10^s), for the squeeze steps.
  const [s, setS] = useState(0)
  const [angle, setAngle] = useState(0.9)
  const [h, setH] = useState(1)
  const [n, setN] = useState(1)
  const seq = useSequence()

  const tween = (from: number, to: number, set: (v: number) => void, duration = 2.4) =>
    void seq.run(({ tween }) => tween(from, to, { duration, onUpdate: set }))

  useStepEffect({
    squeeze: () => tween(0, -1.6, setS),
    areas: () => tween(1.0, 0.5, setAngle),
    'sin-over-x': () => tween(0.15, -1.5, setS),
    exponential: () => tween(1, 0.02, setH),
    // n moves in whole steps, so the tween drives a continuous value that the points round.
    compound: () => tween(1, 20, setN, 3),
  })

  const d = 10 ** s
  const stop = () => seq.cancel()

  const dragNear = ([px]: Vec2) => {
    stop()
    setS(Math.log10(clamp(Math.abs(px), 0.01, 1)))
  }

  const { b, tex: bTex, ln } = BASES[base]
  const exp = (x: number) => b ** x
  const slope = (b ** h - 1) / h
  const hSafe = Math.abs(h) < 1e-9 ? 1e-9 : h

  const whole = Math.max(1, Math.round(n))
  const value = (1 + 1 / whole) ** whole

  const [ca, sa, ta] = [Math.cos(angle), Math.sin(angle), Math.tan(angle)]

  return (
    <>
      <Stage
        zoomable={id !== 'areas'}
        domain={DOMAINS[id as keyof typeof DOMAINS] ?? DOMAINS.squeeze}
        ariaLabel="Graphs and a unit circle showing the squeeze theorem and standard limits"
        overlay={
          <Overlay corner="top-left">
            {id === 'squeeze' && (
              <ReadoutPanel title="Squeezed at 0">
                <Readout label="$x$" value={fmt(d, 4)} color={vc.yellow} />
                <Readout label="$-|x|$" value={fmt(-d, 4)} color={vc.teal} />
                <Readout label="$x \sin\frac{1}{x}$" value={fmt(wiggle(d), 4)} color={vc.blue} />
                <Readout label="$|x|$" value={fmt(d, 4)} color={vc.teal} />
                <Readout
                  label="limit"
                  value={<Tex>{'\\lim_{x \\to 0} x \\sin\\tfrac{1}{x} = 0'}</Tex>}
                  hint="Both bounds tend to $0$, and the function is trapped between them, so it has no room to go anywhere else."
                />
              </ReadoutPanel>
            )}
            {id === 'areas' && (
              <ReadoutPanel title="Areas">
                <Readout label="angle $x$" value={fmt(angle, 3)} color={vc.fg} />
                <Readout
                  label="triangle $OAP$"
                  value={fmt(sa / 2, 4)}
                  color={vc.teal}
                  hint="Base $1$, height $\sin x$."
                />
                <Readout
                  label="sector $OAP$"
                  value={fmt(angle / 2, 4)}
                  color={vc.blue}
                  hint="A sector of angle $x$ in a circle of radius $1$ has area $\frac{x}{2}$: the fraction $\frac{x}{2\pi}$ of the area $\pi$."
                />
                <Readout
                  label="triangle $OAT$"
                  value={fmt(ta / 2, 4)}
                  color={vc.yellow}
                  hint="Base $1$, height $\tan x$, by similar triangles."
                />
              </ReadoutPanel>
            )}
            {id === 'sin-over-x' && (
              <ReadoutPanel title="Squeezed at 0">
                <Readout label="$x$" value={fmt(d, 4)} color={vc.yellow} />
                <Readout label="$\cos x$" value={fmt(Math.cos(d), 6)} color={vc.teal} />
                <Readout label="$\frac{\sin x}{x}$" value={fmt(sinc(d), 6)} color={vc.blue} />
                <Readout label="upper bound" value="1" color={vc.teal} />
                <Readout
                  label="limit"
                  value={<Tex>{'\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1'}</Tex>}
                  hint="For negative $x$ both $\sin x$ and $x$ change sign, so the quotient is the same as at $-x$."
                />
              </ReadoutPanel>
            )}
            {id === 'exponential' && (
              <ReadoutPanel title="Secant at 0">
                <Readout label="$f(x)$" value={<Tex>{`${bTex}^x`}</Tex>} color={vc.blue} />
                <Readout label="$h$" value={fmt(h, 4)} color={vc.yellow} />
                <Readout
                  label="slope"
                  value={<Tex>{`\\frac{${bTex}^h - 1}{h} = ${fmt(slope, 4)}`}</Tex>}
                  color={vc.teal}
                />
                <Readout
                  label="limit"
                  value={<Tex>{`\\lim_{h \\to 0} \\frac{${bTex}^h - 1}{h} = ${ln}`}</Tex>}
                  hint="This limit is the slope of the tangent at $x = 0$. The Derivatives unit shows why it equals $\ln b$."
                />
              </ReadoutPanel>
            )}
            {id === 'compound' && (
              <ReadoutPanel title="Toward e">
                <Readout label="$n$" value={String(whole)} color={vc.yellow} />
                <Readout label="$t = \frac{1}{n}$" value={fmt(1 / whole, 4)} color={vc.yellow} />
                <Readout label="$(1 + \frac{1}{n})^n$" value={fmt(value, 6)} color={vc.blue} />
                <Readout
                  label="$e - $ value"
                  value={fmt(Math.E - value, 6)}
                  hint="The gap shrinks roughly like $\frac{e}{2n}$: twice the $n$, half the gap."
                />
                <Readout
                  label="limit"
                  value={
                    <Tex>{'\\lim_{n \\to \\infty} \\left(1 + \\tfrac{1}{n}\\right)^n = e'}</Tex>
                  }
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        {id !== 'areas' && (
          <>
            <Grid
              step={id === 'compound' ? 0.5 : id === 'sin-over-x' || id === 'exponential' ? 1 : 0.5}
            />
            <Axes
              step={id === 'compound' ? 0.5 : id === 'sin-over-x' || id === 'exponential' ? 1 : 0.5}
            />
          </>
        )}

        {id === 'squeeze' && (
          <>
            <FunctionPlot f={Math.abs} color={vc.teal} width={1.75} dash="5 6" />
            <FunctionPlot f={(x) => -Math.abs(x)} color={vc.teal} width={1.75} dash="5 6" />
            <FunctionPlot f={wiggle} color={vc.blue} samples={4000} width={2} />
            <Segment from={[d, -d]} to={[d, d]} color={vc.yellow} width={1.25} dash="4 5" />
            <Point at={[d, wiggle(d)]} color={vc.blue} r={4} />
            <Point at={[d, 0]} color={vc.yellow} label="x" onDrag={dragNear} />
            <Point at={[0, 0]} color={vc.blue} hollow coords={false} />
          </>
        )}

        {id === 'areas' && (
          <>
            <Segment from={[-0.2, 0]} to={[1.45, 0]} color={vc.axis} width={1.25} />
            <Segment from={[0, -0.2]} to={[0, 2]} color={vc.axis} width={1.25} />
            <Arc r={1} from={0} to={Math.PI / 2} color={vc.muted} width={1.5} />
            <Path
              points={[
                [0, 0],
                [1, 0],
                [1, ta],
              ]}
              closed
              color={vc.yellow}
              width={1.5}
              fill={vc.yellow}
              fillOpacity={0.12}
            />
            <Arc
              r={1}
              from={0}
              to={angle}
              color={vc.blue}
              width={2}
              fill={vc.blue}
              fillOpacity={0.2}
            />
            <Path
              points={[
                [0, 0],
                [1, 0],
                [ca, sa],
              ]}
              closed
              color={vc.teal}
              width={1.5}
              fill={vc.teal}
              fillOpacity={0.3}
            />
            <Segment from={[ca, 0]} to={[ca, sa]} color={vc.teal} width={1.25} dash="4 4" />
            <Arc r={0.18} from={0} to={angle} color={vc.fg} width={1.25} />
            <MathLabel at={[0, 0]} tex="O" anchor="sw" offset={6} color={vc.muted} />
            <MathLabel at={[1, 0]} tex="A" anchor="se" offset={6} color={vc.muted} />
            <MathLabel at={[1, ta]} tex="T" anchor="e" offset={8} color={vc.yellow} />
            <MathLabel
              at={[0.2 * Math.cos(angle / 2), 0.2 * Math.sin(angle / 2)]}
              tex="x"
              anchor="e"
              offset={6}
            />
            <MathLabel
              at={[(1 + ca) / 2, sa / 2]}
              tex="\sin x"
              anchor="w"
              offset={10}
              color={vc.teal}
            />
            <MathLabel at={[1, ta / 2]} tex="\tan x" anchor="e" offset={8} color={vc.yellow} />
            <Point at={[1, ta]} color={vc.yellow} r={4} coords={false} />
            <Point
              at={[ca, sa]}
              color={vc.blue}
              label="P"
              coords={false}
              onDrag={([px, py]) => {
                stop()
                setAngle(clamp(Math.atan2(py, px), 0.05, MAX_ANGLE))
              }}
            />
          </>
        )}

        {id === 'sin-over-x' && (
          <>
            <Segment
              from={[-Math.PI / 2, 1]}
              to={[Math.PI / 2, 1]}
              color={vc.teal}
              width={1.75}
              dash="5 6"
            />
            <FunctionPlot
              f={Math.cos}
              domain={[-Math.PI / 2, Math.PI / 2]}
              color={vc.teal}
              width={1.75}
              dash="5 6"
            />
            <FunctionPlot f={sinc} color={vc.blue} />
            {[-d, d].map((x) => (
              <g key={x < 0 ? 'left' : 'right'}>
                <Segment
                  from={[x, Math.cos(x)]}
                  to={[x, 1]}
                  color={vc.yellow}
                  width={1.25}
                  dash="4 5"
                />
                <Point at={[x, sinc(x)]} color={vc.blue} r={4} />
              </g>
            ))}
            <Point at={[d, 0]} color={vc.yellow} label="x" onDrag={dragNear} />
            <Point at={[0, 1]} color={vc.blue} hollow coords={false} />
            <MathLabel at={[Math.PI / 2, 0]} tex="\cos x" anchor="ne" offset={6} color={vc.teal} />
          </>
        )}

        {id === 'exponential' && (
          <>
            <FunctionPlot f={exp} color={vc.blue} />
            <Segment from={[0, 1]} to={[hSafe, b ** hSafe]} extend color={vc.teal} width={1.75} />
            <Point at={[0, 1]} color={vc.blue} />
            <Point at={[hSafe, b ** hSafe]} color={vc.blue} r={4} />
            <Segment
              from={[hSafe, 0]}
              to={[hSafe, b ** hSafe]}
              color={vc.yellow}
              width={1.25}
              dash="4 5"
            />
            <Point
              at={[hSafe, 0]}
              color={vc.yellow}
              label="h"
              onDrag={([px]) => {
                stop()
                setH(clamp(px, -1.5, 1.5))
              }}
            />
          </>
        )}

        {id === 'compound' && (
          <>
            <Segment
              from={[0, Math.E]}
              to={[1, Math.E]}
              extend
              color={vc.teal}
              width={1.25}
              dash="4 5"
            />
            <FunctionPlot
              f={compound}
              domain={[-0.65, 1.2]}
              color={vc.blue}
              width={1.5}
              dash="5 6"
            />
            {Array.from({ length: whole }, (_, i) => i + 1).map((k) => (
              <Point
                key={k}
                at={[1 / k, (1 + 1 / k) ** k]}
                color={k === whole ? vc.yellow : vc.blue}
                r={k === whole ? 5 : 3}
                coords={(p) => `n = ${k}: ${fmt(p[1], 5)}`}
              />
            ))}
            <Point at={[0, Math.E]} color={vc.blue} hollow coords={false} />
            <MathLabel at={[1.2, Math.E]} tex="y = e" anchor="ne" offset={6} color={vc.teal} />
          </>
        )}
      </Stage>

      <VizControls>
        {(id === 'squeeze' || id === 'sin-over-x') && (
          <LabeledSlider
            label="distance from $0$"
            value={s}
            onChange={(v) => {
              stop()
              setS(v)
            }}
            min={-2}
            max={0}
            step={0.01}
            format={(v) => fmt(10 ** v, 3)}
            color={vc.yellow}
          />
        )}
        {id === 'areas' && (
          <LabeledSlider
            label="angle $x$"
            value={angle}
            onChange={(v) => {
              stop()
              setAngle(v)
            }}
            min={0.05}
            max={MAX_ANGLE}
            step={0.01}
            format={(v) => fmt(v, 2)}
            color={vc.blue}
          />
        )}
        {id === 'exponential' && (
          <>
            <SegmentedControl
              label="Base $b$"
              value={base}
              onChange={setBase}
              options={[
                { value: '2', label: '$2$' },
                { value: 'e', label: '$e$' },
                { value: '3', label: '$3$' },
              ]}
            />
            <LabeledSlider
              label="$h$"
              value={h}
              onChange={(v) => {
                stop()
                setH(Math.abs(v) < 0.005 ? 0.005 : v)
              }}
              min={-1.5}
              max={1.5}
              step={0.005}
              format={(v) => fmt(v, 3)}
              color={vc.yellow}
            />
          </>
        )}
        {id === 'compound' && (
          <LabeledSlider
            label="$n$"
            value={whole}
            onChange={(v) => {
              stop()
              setN(v)
            }}
            min={1}
            max={MAX_N}
            step={1}
            format={(v) => String(Math.round(v))}
            color={vc.yellow}
          />
        )}
      </VizControls>
    </>
  )
}
