import { useState } from 'react'
import { clamp, fmt, lerpVec, linspace, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes,
  Grid,
  MathLabel,
  Overlay,
  Path,
  Point,
  Segment,
  Stage,
  useAnimatedValue,
  useSequence,
  useStepEffect,
  useVizStep,
  VizControls,
} from '@/viz-kit'

interface Case {
  label: string
  tex: string
  f: (x: number) => number
  /** Undefined when f has no inverse on this domain. */
  inv?: (y: number) => number
  invTex?: string
  domain: readonly [number, number]
  /** Whether the left end of the domain is a real endpoint (drawn as a dot). */
  closedStart?: boolean
}

const cases = {
  linear: {
    label: '2x + 1',
    tex: 'f(x) = 2x + 1',
    f: (x) => 2 * x + 1,
    inv: (y) => (y - 1) / 2,
    invTex: 'f^{-1}(x) = \\tfrac{x - 1}{2}',
    domain: [-3.5, 2.6],
  },
  square: {
    label: 'x² − 1',
    tex: 'f(x) = x^2 - 1',
    f: (x) => x * x - 1,
    domain: [-2.6, 2.6],
  },
  half: {
    label: 'x² − 1, x ≥ 0',
    tex: 'f(x) = x^2 - 1,\\ x \\geq 0',
    f: (x) => x * x - 1,
    inv: (y) => Math.sqrt(y + 1),
    invTex: 'f^{-1}(x) = \\sqrt{x + 1}',
    domain: [0, 2.6],
    closedStart: true,
  },
} satisfies Record<string, Case>

type CaseId = keyof typeof cases

export default function Inverses() {
  const { id } = useVizStep()
  const [caseId, setCaseId] = useState<CaseId>('linear')
  const [a, setA] = useState(1)
  const [t, setT] = useState(0)
  const [c, setC] = useState(3)
  const seq = useSequence()
  const k: Case = cases[caseId]

  const testing = id === 'horizontal-line'
  const lineOpacity = useAnimatedValue(testing ? 1 : 0, { duration: 0.5 })
  const reflect = (to: number, duration = 1.8) =>
    seq.run(({ tween }) => tween(t, to, { duration, onUpdate: setT }))

  useStepEffect({
    undo: () => {
      setCaseId('linear')
      setA(1)
      reflect(0, 0.6)
    },
    reflect: () => {
      setCaseId('linear')
      setA(1)
      void seq.run(async ({ tween, wait }) => {
        await tween(t, 0, { duration: 0.4 * t, onUpdate: setT })
        await wait(0.3)
        await tween(0, 1, { duration: 2, onUpdate: setT })
      })
    },
    'horizontal-line': () => {
      setCaseId('square')
      setA(2)
      setC(3)
      reflect(1, 0.8)
    },
    restrict: () => {
      setCaseId('half')
      setA(2)
      reflect(1, 0.8)
    },
  })

  const choose = (v: CaseId) => {
    setCaseId(v)
    setA((p) => clamp(p, cases[v].domain[0], cases[v].domain[1]))
  }

  const [d0, d1] = k.domain
  const fx = k.f(a)
  const P: Vec2 = [a, fx]
  const Q: Vec2 = [fx, a]
  const samples = linspace(d0, d1, 200)
  const graph = samples.map((x): Vec2 => [x, k.f(x)])
  const mirrored = graph.map(([x, y]) => lerpVec([x, y], [y, x], t))
  const crossings = testing ? [-Math.sqrt(c + 1), Math.sqrt(c + 1)].filter((x) => x >= d0) : []
  const inverseValue = k.inv?.(fx)

  return (
    <>
      <Stage
        domain={{ x: [-4, 6], y: [-3, 6] }}
        ariaLabel="Graph of a function, its reflection across the line y = x, and a point with its mirror image"
        overlay={
          <>
            <Overlay corner="top-left">
              <div style={{ display: 'grid', gap: 6, fontSize: 17 }}>
                <span style={{ color: vc.blue }}>
                  <Tex>{k.tex}</Tex>
                </span>
                <span style={{ color: vc.teal, opacity: t }}>
                  <Tex>{k.invTex ?? '\\text{reflection: not a function}'}</Tex>
                </span>
              </div>
            </Overlay>
            <Overlay corner="top-right">
              <ReadoutPanel>
                <Readout label="$a$" value={fmt(a)} color={vc.blue} />
                <Readout label="$f(a)$" value={fmt(fx)} color={vc.blue} />
                <Readout
                  label="$f^{-1}(f(a))$"
                  value={inverseValue === undefined ? 'not unique' : fmt(inverseValue)}
                  color={vc.teal}
                />
                {testing && (
                  <Readout
                    label="crossings at $y = c$"
                    value={crossings.length}
                    color={vc.yellow}
                  />
                )}
              </ReadoutPanel>
            </Overlay>
          </>
        }
      >
        <Grid />
        <Axes />

        <Segment
          from={[0, 0]}
          to={[1, 1]}
          extend
          color={vc.yellow}
          width={1.5}
          dash="6 6"
          opacity={0.7}
        />
        <MathLabel at={[-2.8, -2.8]} tex="y = x" color={vc.yellow} anchor="nw" />

        <Path points={graph} color={vc.blue} width={2.5} />
        {t > 0.001 && (
          <Path points={mirrored} color={vc.teal} width={2.5} opacity={Math.min(1, t * 3)} />
        )}
        {k.closedStart && (
          <>
            <Point at={graph[0]!} color={vc.blue} r={4.5} />
            {t > 0.001 && <Point at={mirrored[0]!} color={vc.teal} r={4.5} />}
          </>
        )}
        {/* A point and its mirror image, joined across y = x. */}
        <Segment
          from={P}
          to={lerpVec(P, Q, t)}
          color={vc.muted}
          width={1.25}
          dash="3 5"
          opacity={t}
        />
        {t > 0.001 && <Point at={lerpVec(P, Q, t)} color={vc.teal} r={5} />}
        <Point
          at={P}
          color={vc.blue}
          r={6.5}
          onDrag={([x]) => setA(Math.round(clamp(x, d0, d1) * 100) / 100)}
          label="a"
        />
        <MathLabel at={P} tex="(a, f(a))" color={vc.blue} anchor="nw" size={14} />
        <MathLabel at={Q} tex="(f(a), a)" color={vc.teal} anchor="se" size={14} opacity={t} />

        <g style={{ opacity: lineOpacity }}>
          <Segment from={[0, c]} to={[1, c]} extend color={vc.yellow} width={1.25} dash="4 6" />
          {crossings.map((x) => (
            <Point key={x} at={[x, c]} color={vc.yellow} r={5} />
          ))}
        </g>
        {testing && (
          <Point
            at={[0, c]}
            color={vc.yellow}
            r={6}
            onDrag={([, y]) => setC(clamp(y, -1, 5.7))}
            label="c"
          />
        )}
      </Stage>

      <VizControls>
        <SegmentedControl
          label="Function"
          value={caseId}
          onChange={choose}
          options={(Object.keys(cases) as CaseId[]).map((v) => ({
            value: v,
            label: cases[v].label,
          }))}
        />
        <LabeledSlider
          label="Reflect"
          value={t}
          onChange={(v) => {
            seq.cancel()
            setT(v)
          }}
          min={0}
          max={1}
          step={0.01}
          color={vc.teal}
        />
      </VizControls>
    </>
  )
}
