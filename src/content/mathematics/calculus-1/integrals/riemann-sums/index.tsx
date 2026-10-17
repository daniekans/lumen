import { useState } from 'react'
import { fmt, integrate, riemannPieces, riemannSum, type RiemannRule } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { Divider } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl, ToggleField } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  MathLabel,
  Overlay,
  Path,
  Point,
  Stage,
  useAnimatedValue,
  useStepEffect,
  VizControls,
} from '@/viz-kit'
import type { Vec2 } from '@/lib/math'

const f = (x: number) => 1.2 + 0.8 * Math.sin(x) + 0.1 * x
const A = 0.5
const B = 5.5
const EXACT = integrate(f, A, B)

const RULES = [
  { value: 'left', label: 'Left' },
  { value: 'midpoint', label: 'Midpoint' },
  { value: 'right', label: 'Right' },
  { value: 'trapezoid', label: 'Trapezoid' },
] as const

/**
 * Each rule expressed as weights over (f at left edge, f at midpoint, f at right edge), once for
 * the top-left corner of a strip and once for the top-right corner. Blending these vectors morphs
 * one rule into another.
 */
const RULE_WEIGHTS: Record<RiemannRule, readonly number[]> = {
  left: [1, 0, 0, 1, 0, 0],
  midpoint: [0, 1, 0, 0, 1, 0],
  right: [0, 0, 1, 0, 0, 1],
  trapezoid: [1, 0, 0, 0, 0, 1],
}

const exactArea: Vec2[] = [
  [A, 0],
  ...Array.from({ length: 121 }, (_, k): Vec2 => {
    const x = A + ((B - A) * k) / 120
    return [x, f(x)]
  }),
  [B, 0],
]

export default function RiemannSums() {
  const [n, setN] = useState(1)
  const [rule, setRule] = useState<RiemannRule>('left')
  const [showExact, setShowExact] = useState(false)
  const [nDuration, setNDuration] = useState(0.6)

  // n is animated on a log scale so going from 1 to 64 spends equal time on each doubling.
  const nSmooth = 2 ** useAnimatedValue(Math.log2(n), { duration: nDuration })
  const w = useAnimatedValue(RULE_WEIGHTS[rule], { duration: 0.7 })
  const exactOpacity = useAnimatedValue(showExact ? 1 : 0, { duration: 0.6 })

  const changeN = (next: number, duration = 0.6) => {
    setNDuration(duration)
    setN(next)
  }

  useStepEffect({
    one: () => {
      changeN(1)
      setRule('left')
      setShowExact(false)
    },
    more: () => {
      changeN(8, 1.6)
      setRule('left')
      setShowExact(false)
    },
    rules: () => {
      changeN(8)
      setRule('midpoint')
      setShowExact(false)
    },
    limit: () => {
      changeN(64, 3)
      setShowExact(true)
    },
  })

  // Strips for a continuous n: the last strip is clipped at b while new strips slide in.
  const dx = (B - A) / nSmooth
  const count = Math.ceil(nSmooth - 1e-6)
  const strips = Array.from({ length: count }, (_, k) => {
    const x0 = A + k * dx
    const x1 = Math.min(B, x0 + dx)
    const fl = f(x0)
    const fm = f(Math.min(B, x0 + dx / 2))
    const fr = f(Math.min(B, x0 + dx))
    const y0 = w[0]! * fl + w[1]! * fm + w[2]! * fr
    const y1 = w[3]! * fl + w[4]! * fm + w[5]! * fr
    const s0 = x0 + (w[1]! * dx) / 2 + w[2]! * dx
    const s1 = x0 + (w[4]! * dx) / 2 + w[5]! * dx
    return { x0, x1, y0, y1: x1 < x0 + dx ? y0 + ((y1 - y0) * (x1 - x0)) / dx : y1, s0, s1 }
  })

  const sum = riemannSum(riemannPieces(f, A, B, n, rule))
  const error = sum - EXACT
  const strokeWidth = n > 24 ? 0.75 : 1.25

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-0.4, 6.4], y: [-0.7, 3.2] }}
        ariaLabel="Area under a curve approximated by strips"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout label="$n$" value={n} />
              <Readout label="$\Delta x$" value={fmt((B - A) / n, 3)} />
              <Readout label="Riemann sum" value={fmt(sum, 4)} color={vc.yellow} />
              <Readout label="$\int_a^b f(x)\,dx$" value={fmt(EXACT, 4)} color={vc.teal} />
              <Readout label="error" value={fmt(error, 4)} />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {strips.map((s, k) => (
          <Path
            key={k}
            points={[
              [s.x0, 0],
              [s.x0, s.y0],
              [s.x1, s.y1],
              [s.x1, 0],
            ]}
            closed
            color={vc.yellow}
            width={strokeWidth}
            fill={alpha(vc.yellow, 0.16)}
          />
        ))}

        <Path
          points={exactArea}
          closed
          color="none"
          fill={vc.teal}
          fillOpacity={0.3 * exactOpacity}
        />

        <FunctionPlot f={f} color={vc.blue} />

        {n <= 16 &&
          strips.map((s, k) => (
            <g key={k} style={{ opacity: Math.max(0, 1 - (nSmooth - 8) / 8) }}>
              <Point at={[s.s0, f(s.s0)]} color={vc.yellow} r={3.5} />
              {Math.abs(s.s1 - s.s0) > 1e-3 && (
                <Point at={[s.s1, f(s.s1)]} color={vc.yellow} r={3.5} />
              )}
            </g>
          ))}

        <MathLabel at={[A, 0]} tex="a" anchor="s" offset={22} />
        <MathLabel at={[B, 0]} tex="b" anchor="s" offset={22} />
        <MathLabel at={[6.1, f(6.1)]} tex="f(x)" color={vc.blue} anchor="n" offset={14} />
      </Stage>

      <VizControls>
        <LabeledSlider
          label="$n$"
          value={n}
          onChange={(v) => changeN(Math.round(v), 0.35)}
          min={1}
          max={64}
          step={1}
          color={vc.yellow}
          format={(v) => String(Math.round(v))}
        />
        <Divider />
        <SegmentedControl label="Sampling rule" value={rule} onChange={setRule} options={RULES} />
        <Divider />
        <ToggleField
          label="Exact area"
          checked={showExact}
          onChange={setShowExact}
          color={vc.teal}
        />
      </VizControls>
    </>
  )
}
