import { useState } from 'react'
import { bisection, clamp, fmt, lnGamma, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  MathLabel,
  Overlay,
  Point,
  Segment,
  Stage,
  powerOfTen,
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  VizControls,
} from '@/viz-kit'

/** log10 of each function, the height on the logarithmic scale. */
const L = {
  exp2: (x: number) => x * Math.log10(2),
  exp10: (x: number) => x,
  power: (p: number) => (x: number) => (x > 0 ? p * Math.log10(x) : NaN),
  ln: (x: number) => (x > 1 ? Math.log10(Math.log(x)) : NaN),
  factorial: (x: number) => (x >= 0 ? lnGamma(x + 1) / Math.LN10 : NaN),
}

/** A value given by its log10, as text: 1.27e30 style past a million. */
const fromLog = (l: number) => {
  if (!Number.isFinite(l)) return 'undefined'
  if (l < 6) return fmt(10 ** l, 3)
  const e = Math.floor(l)
  return `${fmt(10 ** (l - e), 2)}e${e}`
}

/** The last x where 2^x = x^p, past which 2^x stays ahead; undefined when it is ahead from the start. */
const crossing = (p: number) => {
  const g = (x: number) => x * Math.LN2 - p * Math.log(x)
  // g has its minimum at x = p / ln 2; the last root lies beyond it.
  const lo = Math.max(1, p / Math.LN2)
  if (g(lo) >= 0) return undefined
  return bisection(g, lo, 1000, 60).at(-1)!.mid
}

const ratio = (x: number) => (3 * 2 ** x + x ** 4) / (2 ** x + x * x)
const bigO = (x: number) => (3 * x * x + 5 * x + 2) / (x * x)
/** The x from which 3x^2 + 5x + 2 <= C x^2, the larger root of (C - 3)x^2 - 5x - 2. */
const threshold = (C: number) => (5 + Math.sqrt(25 + 8 * (C - 3))) / (2 * (C - 3))

const LOG_STEPS = ['log-scale', 'powers', 'logarithm', 'factorial']

export default function GrowthRates() {
  const { id } = useVizStep()
  const [p, setP] = useVizParam<number>('p', 5)
  const [C, setC] = useVizParam<number>('C', 4)
  const [x, setX] = useState(10)
  const seq = useSequence()

  const tweenX = (from: number, to: number) =>
    void seq.run(({ tween }) => tween(from, to, { duration: 2.6, onUpdate: setX }))

  useStepEffect({
    'log-scale': () => tweenX(2, 20),
    powers: () => tweenX(5, 30),
    logarithm: () => tweenX(2, 30),
    factorial: () => tweenX(5, 30),
    'dominant-terms': () => tweenX(0, 30),
    'big-o': () => seq.cancel(),
  })
  const stop = () => seq.cancel()
  const drag =
    (max: number) =>
    ([px]: Vec2) => {
      stop()
      setX(clamp(px, 0.5, max))
    }

  const logScale = LOG_STEPS.includes(id ?? '')
  const domain =
    id === 'factorial'
      ? { x: [-2, 42] as const, y: [-2, 40] as const }
      : id === 'dominant-terms'
        ? { x: [-2, 40] as const, y: [-1, 18] as const }
        : id === 'big-o'
          ? { x: [-1, 20] as const, y: [-1, 10] as const }
          : { x: [-2, 42] as const, y: [-2, 16] as const }
  const gridStep = id === 'factorial' ? 10 : id === 'big-o' ? 2 : 5

  const cross = crossing(p)

  return (
    <>
      <Stage
        zoomable
        domain={domain}
        ariaLabel="Functions compared on a logarithmic scale, a ratio with dominant terms, and a big-O bound"
        overlay={
          <Overlay corner="top-left">
            {id === 'log-scale' && (
              <ReadoutPanel title="Log scale">
                <Readout label="$x$" value={fmt(x, 2)} color={vc.yellow} />
                <Readout label="$2^x$" value={fromLog(L.exp2(x))} color={vc.blue} />
                <Readout label="$10^x$" value={fromLog(L.exp10(x))} color={vc.teal} />
                <Readout
                  label="slope of $2^x$"
                  value="$\log_{10} 2 \approx 0.301$"
                  hint="$\log_{10} 2^x = x \log_{10} 2$: a line through the origin."
                />
              </ReadoutPanel>
            )}
            {id === 'powers' && (
              <ReadoutPanel title="Power against exponential">
                <Readout label="$x$" value={fmt(x, 2)} color={vc.yellow} />
                <Readout label={`$x^{${p}}$`} value={fromLog(L.power(p)(x))} color={vc.teal} />
                <Readout label="$2^x$" value={fromLog(L.exp2(x))} color={vc.blue} />
                <Readout
                  label="$2^x$ ahead for good from"
                  value={cross === undefined ? 'the start' : `$x \\approx ${fmt(cross, 2)}$`}
                  hint="The last solution of $2^x = x^p$. Past it, $\frac{x^p}{2^x} \to 0$."
                />
              </ReadoutPanel>
            )}
            {id === 'logarithm' && (
              <ReadoutPanel title="Logarithm against powers">
                <Readout label="$x$" value={fmt(x, 2)} color={vc.yellow} />
                <Readout label="$\ln x$" value={fromLog(L.ln(x))} color={vc.teal} />
                <Readout label="$\sqrt{x}$" value={fromLog(L.power(0.5)(x))} color={vc.blue} />
                <Readout
                  label="$\frac{\ln x}{\sqrt{x}}$"
                  value={fmt(x > 1 ? Math.log(x) / Math.sqrt(x) : NaN, 4)}
                  hint="It peaks at $x = e^2$ and then tends to $0$."
                />
              </ReadoutPanel>
            )}
            {id === 'factorial' && (
              <ReadoutPanel title="Factorial against exponentials">
                <Readout label="$x$" value={fmt(x, 2)} color={vc.yellow} />
                <Readout label="$x!$" value={fromLog(L.factorial(x))} color={vc.teal} />
                <Readout label="$10^x$" value={fromLog(L.exp10(x))} color={vc.blue} />
                <Readout
                  label="$x!$ between whole numbers"
                  value="$\Gamma(x + 1)$"
                  hint="The gamma function extends the factorial to real numbers, so the curve is smooth. At whole numbers it is the factorial."
                />
              </ReadoutPanel>
            )}
            {id === 'dominant-terms' && (
              <ReadoutPanel title="A ratio">
                <Readout label="$x$" value={fmt(x, 2)} color={vc.yellow} />
                <Readout
                  label="$\frac{3 \cdot 2^x + x^4}{2^x + x^2}$"
                  value={fmt(ratio(x), 4)}
                  color={vc.blue}
                />
                <Readout
                  label="$\frac{x^4}{3 \cdot 2^x}$"
                  value={fmt(x ** 4 / (3 * 2 ** x), 4)}
                  hint="The power against the exponential on top. Once this is small, the exponentials decide."
                />
                <Readout label="limit" value="$3$" color={vc.teal} />
              </ReadoutPanel>
            )}
            {id === 'big-o' && (
              <ReadoutPanel title="Big-O">
                <Readout label="$C$" value={fmt(C, 2)} color={vc.teal} />
                <Readout
                  label="$f(x) \le C x^2$ from"
                  value={C > 3 ? `$x_0 \\approx ${fmt(threshold(C), 3)}$` : 'never for good'}
                  color={vc.yellow}
                  hint={
                    C > 3
                      ? 'The larger root of $(C - 3)x^2 - 5x - 2 = 0$. A larger $C$ gives a smaller $x_0$.'
                      : 'The ratio $\\frac{f(x)}{x^2}$ stays above $3$, so no $C \\le 3$ bounds it.'
                  }
                />
                <Readout label="limit of the ratio" value="$3$" color={vc.blue} />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid step={gridStep} />
        <Axes step={gridStep} formatY={logScale ? powerOfTen : undefined} />

        {id === 'log-scale' && (
          <>
            <FunctionPlot f={L.exp10} color={vc.teal} />
            <FunctionPlot f={L.exp2} color={vc.blue} />
            <MathLabel at={[14, 14]} tex="10^x" anchor="w" offset={10} color={vc.teal} />
            <MathLabel at={[34, L.exp2(34)]} tex="2^x" anchor="n" offset={10} color={vc.blue} />
          </>
        )}

        {id === 'powers' && (
          <>
            <FunctionPlot f={L.exp2} color={vc.blue} />
            <FunctionPlot f={L.power(p)} domain={[1, Infinity]} color={vc.teal} />
            {cross !== undefined && cross < 42 && (
              <Point at={[cross, L.exp2(cross)]} color={vc.fg} r={4} coords={false} />
            )}
            <MathLabel at={[34, L.exp2(34)]} tex="2^x" anchor="n" offset={10} color={vc.blue} />
            <MathLabel
              at={[34, L.power(p)(34)]}
              tex={`x^{${p}}`}
              anchor="s"
              offset={10}
              color={vc.teal}
            />
          </>
        )}

        {id === 'logarithm' && (
          <>
            <FunctionPlot f={L.exp2} color={vc.blue} opacity={0.35} />
            <FunctionPlot f={L.power(0.5)} domain={[1, Infinity]} color={vc.blue} />
            <FunctionPlot f={L.ln} color={vc.teal} />
            <MathLabel
              at={[34, L.power(0.5)(34)]}
              tex="\sqrt{x}"
              anchor="n"
              offset={10}
              color={vc.blue}
            />
            <MathLabel at={[34, L.ln(34)]} tex="\ln x" anchor="s" offset={10} color={vc.teal} />
          </>
        )}

        {id === 'factorial' && (
          <>
            <FunctionPlot f={L.exp2} color={vc.blue} opacity={0.35} />
            <FunctionPlot f={L.exp10} color={vc.blue} />
            <FunctionPlot f={L.factorial} color={vc.teal} />
            <Point at={[25, 25]} color={vc.fg} r={4} coords={false} />
            <MathLabel at={[25, 25]} tex="n = 25" anchor="se" offset={8} color={vc.muted} />
            <MathLabel at={[33, 37]} tex="x!" anchor="w" offset={10} color={vc.teal} />
          </>
        )}

        {logScale && (
          <>
            <Segment
              from={[x, domain.y[0]]}
              to={[x, domain.y[1]]}
              color={vc.yellow}
              width={1.25}
              dash="4 5"
            />
            <Point at={[x, 0]} color={vc.yellow} label="x" coords={false} onDrag={drag(40)} />
          </>
        )}

        {id === 'dominant-terms' && (
          <>
            <Segment from={[0, 3]} to={[1, 3]} extend color={vc.teal} width={1.25} dash="4 5" />
            <FunctionPlot f={ratio} domain={[0, Infinity]} color={vc.blue} />
            <Segment from={[x, 0]} to={[x, ratio(x)]} color={vc.yellow} width={1.25} dash="4 5" />
            <Point at={[x, ratio(x)]} color={vc.blue} r={4} />
            <Point at={[x, 0]} color={vc.yellow} label="x" onDrag={drag(40)} />
            <MathLabel at={[38, 3]} tex="y = 3" anchor="n" offset={8} color={vc.teal} />
          </>
        )}

        {id === 'big-o' && (
          <>
            <Segment from={[0, C]} to={[1, C]} extend color={vc.teal} width={1.5} dash="5 6" />
            <FunctionPlot f={bigO} domain={[0, Infinity]} color={vc.blue} />
            {C > 3 && threshold(C) < 20 && (
              <>
                <Segment
                  from={[threshold(C), 0]}
                  to={[threshold(C), C]}
                  color={vc.yellow}
                  width={1.25}
                  dash="4 5"
                />
                <Segment
                  from={[threshold(C), 0]}
                  to={[20, 0]}
                  color={vc.yellow}
                  width={4}
                  opacity={0.5}
                />
                <Point at={[threshold(C), 0]} color={vc.yellow} label="x₀" coords={false} />
              </>
            )}
            <MathLabel
              at={[1.2, bigO(1.2)]}
              tex="\frac{f(x)}{x^2}"
              anchor="e"
              offset={10}
              color={vc.blue}
            />
            <MathLabel at={[19, C]} tex="C" anchor="n" offset={8} color={vc.teal} />
          </>
        )}
      </Stage>

      <VizControls>
        {logScale && (
          <LabeledSlider
            label="$x$"
            value={x}
            onChange={(v) => {
              stop()
              setX(v)
            }}
            min={0.5}
            max={40}
            step={0.1}
            format={(v) => fmt(v, 1)}
            color={vc.yellow}
          />
        )}
        {id === 'powers' && (
          <LabeledSlider
            label="power $p$"
            value={p}
            onChange={setP}
            min={1}
            max={10}
            step={1}
            format={(v) => String(v)}
            color={vc.teal}
          />
        )}
        {id === 'dominant-terms' && (
          <LabeledSlider
            label="$x$"
            value={x}
            onChange={(v) => {
              stop()
              setX(v)
            }}
            min={0}
            max={40}
            step={0.1}
            format={(v) => fmt(v, 1)}
            color={vc.yellow}
          />
        )}
        {id === 'big-o' && (
          <LabeledSlider
            label="$C$"
            value={C}
            onChange={setC}
            min={2}
            max={8}
            step={0.1}
            format={(v) => fmt(v, 1)}
            color={vc.teal}
          />
        )}
      </VizControls>
    </>
  )
}
