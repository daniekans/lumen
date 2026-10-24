import { clamp, polyDerivative, polyEval, polyFromRoots, signChanges, type Vec2 } from '@/lib/math'
import { tex } from '@/lib/practice'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  MathLabel,
  numbersCodec,
  Overlay,
  Point,
  Stage,
  useStepEffect,
  useVizParam,
  useVizStep,
  type ParamCodec,
  VizControls,
} from '@/viz-kit'

const { num, signed } = tex

type Sign = 'pos' | 'neg'

const zerosCodec = numbersCodec(['r1', 'r2', 'r3'] as const)
const multCodec = numbersCodec(['m1', 'm2', 'm3'] as const)
const signCodec: ParamCodec<Sign> = {
  encode: (s) => s,
  decode: (t) => (t === 'pos' || t === 'neg' ? t : undefined),
}

const SIGN_OPTIONS = [
  { value: 'pos' as const, label: '$a > 0$' },
  { value: 'neg' as const, label: '$a < 0$' },
]

/** Size of the leading coefficient by degree, so the graph stays readable as the degree grows. */
const scale = (n: number) => 2 ** -(n - 2)

/** (x - r)^m as TeX: (x + 1)^{2}, x^{3}, (x - 2). */
const factorTex = (r: number, m: number) => {
  const base = r === 0 ? 'x' : `(x${signed(-r)})`
  return m === 1 ? base : `${base}^{${m}}`
}

/** "+\infty" or "-\infty". */
const inf = (s: number) => (s > 0 ? '+\\infty' : '-\\infty')

export default function PolynomialGraphs() {
  const { id } = useVizStep()
  const [z, setZ] = useVizParam('z', { r1: -3, r2: -1, r3: 2 }, zerosCodec)
  const [m, setM] = useVizParam('m', { m1: 1, m2: 1, m3: 1 }, multCodec)
  const [sign, setSign] = useVizParam<Sign>('a', 'pos', signCodec)

  useStepEffect({
    zeros: () => {
      setM({ m1: 1, m2: 1, m3: 1 })
      setSign('pos')
    },
    multiplicity: () => setM({ m1: 1, m2: 2, m3: 1 }),
    'end-behavior': () => setSign('pos'),
  })

  const roots = [z.r1, z.r2, z.r3]
  const mults = [m.m1, m.m2, m.m3]
  const n = mults.reduce((s, k) => s + k, 0)
  const a = (sign === 'pos' ? 1 : -1) * scale(n)

  // Equal zeros merge into one factor whose multiplicity is the sum.
  const byRoot = new Map<number, number>()
  roots.forEach((r, i) => byRoot.set(r, (byRoot.get(r) ?? 0) + mults[i]!))
  const factors = [...byRoot.entries()].sort(([u], [v]) => u - v)

  const p = polyFromRoots(
    factors.flatMap(([r, k]) => Array<number>(k).fill(r)),
    a,
  )
  const f = (x: number) => polyEval(p, x)
  const lead = (x: number) => a * x ** n
  const dp = polyDerivative(p)
  const turns = signChanges((x) => polyEval(dp, x), -6, 6, 1200)

  const moveZero =
    (i: 0 | 1 | 2) =>
    ([px]: Vec2) => {
      const r = Math.round(clamp(px, -4, 4) * 2) / 2
      setZ({ ...z, [`r${i + 1}`]: r })
    }

  const factoredTex = `${num(a, 256)}${factors.map(([r, k]) => factorTex(r, k)).join('')}`
  const leftSign = Math.sign(a) * (n % 2 === 0 ? 1 : -1)
  const ratio = (x: number) => f(x) / lead(x)

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-5, 5], y: [-4, 4] }}
        ariaLabel="The graph of a polynomial with draggable zeros"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel title="Polynomial">
              <Readout label="$p(x)$" value={<Tex>{factoredTex}</Tex>} color={vc.blue} />
              <Readout
                label="degree $n$"
                value={String(n)}
                hint="The sum of the multiplicities: the highest power of $x$ after expanding."
              />
              {id === 'zeros' && (
                <Readout
                  label="zeros"
                  value={<Tex>{factors.map(([r]) => num(r)).join(',\\ ')}</Tex>}
                  color={vc.teal}
                />
              )}
              {id === 'multiplicity' &&
                factors.map(([r, k]) => (
                  <Readout
                    key={r}
                    label={`$x = ${num(r)}$`}
                    value={`${k % 2 ? 'crosses' : 'touches'}, $m = ${k}$`}
                    color={vc.teal}
                  />
                ))}
              {id === 'end-behavior' && (
                <>
                  <Readout
                    label="leading term"
                    value={<Tex>{`${num(a, 256)}x^{${n}}`}</Tex>}
                    color={vc.yellow}
                    hint="The term with the highest power after expanding. The other terms grow more slowly."
                  />
                  <Readout
                    label="$p(10) / ax^n$"
                    value={ratio(10).toFixed(3)}
                    hint="How close $p$ is to its leading term, as a ratio. It tends to $1$ as $x$ grows."
                  />
                  <Readout label="$p(100) / ax^n$" value={ratio(100).toFixed(3)} />
                  <Readout
                    label="ends"
                    value={
                      <Tex>{`x \\to -\\infty{:}\\ ${inf(leftSign)},\\quad x \\to +\\infty{:}\\ ${inf(Math.sign(a))}`}</Tex>
                    }
                  />
                </>
              )}
              {id === 'turning-points' && (
                <>
                  <Readout
                    label="turning points"
                    value={String(turns.length)}
                    color={vc.yellow}
                    hint="Points where the graph switches between rising and falling."
                  />
                  <Readout label="at most" value={<Tex>{`n - 1 = ${n - 1}`}</Tex>} />
                </>
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <Axes />
        {id === 'end-behavior' && (
          <FunctionPlot f={lead} color={vc.yellow} width={1.75} dash="5 6" />
        )}
        <FunctionPlot f={f} color={vc.blue} />
        {id === 'turning-points' &&
          turns.map((t, i) => <Point key={i} at={[t, f(t)]} color={vc.yellow} r={4} />)}
        {roots.map((r, i) => (
          <Point
            key={i}
            at={[r, 0]}
            color={vc.teal}
            label={`Zero ${i + 1}`}
            onDrag={moveZero(i as 0 | 1 | 2)}
          />
        ))}
        {roots.map((r, i) => (
          <MathLabel
            key={i}
            at={[r, 0]}
            tex={`r_${i + 1}`}
            color={vc.teal}
            anchor="n"
            offset={14 + 18 * roots.slice(0, i).filter((q) => q === r).length}
          />
        ))}
        {id === 'multiplicity' &&
          factors
            .filter(([, k]) => k > 1)
            .map(([r, k]) => (
              <MathLabel
                key={r}
                at={[r, 0]}
                tex={`\\times ${k}`}
                color={vc.teal}
                anchor="s"
                offset={22}
              />
            ))}
      </Stage>

      <VizControls>
        {(id === 'multiplicity' || id === 'turning-points') &&
          ([0, 1, 2] as const).map((i) => (
            <LabeledSlider
              key={i}
              label={`multiplicity of $r_${i + 1}$`}
              value={mults[i]!}
              onChange={(v) => setM({ ...m, [`m${i + 1}`]: v })}
              min={1}
              max={3}
              step={1}
              format={(v) => String(v)}
              color={vc.teal}
            />
          ))}
        {id === 'end-behavior' && (
          <SegmentedControl label="Sign" value={sign} onChange={setSign} options={SIGN_OPTIONS} />
        )}
      </VizControls>
    </>
  )
}
