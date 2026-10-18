import { clamp, fmt, type Interval, largestDelta, thresholdN } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  AxisInterval,
  Axes,
  Band,
  FunctionPlot,
  Grid,
  MathLabel,
  Overlay,
  Point,
  Segment,
  Stage,
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const A = 2
const L = 2
/** x^2 / 4 + 1 with its point at x = 2 moved to 3, so the limit 2 differs from the value. */
const f = (x: number) => (x === A ? 3 : (x * x) / 4 + 1)
const curve = (x: number) => (x * x) / 4 + 1

/** A jump at 2: left pieces approach 1, right pieces 2.5. */
const jump = (x: number) => (x < A ? x / 2 : x / 2 + 1.5)

/** Wiggles that settle on 2 far out. */
const wiggle = (x: number) => (x === 0 ? 8 : 2 + (6 * Math.sin(x)) / x)
const FAR = 200

/** The inputs near 2 whose outputs land in the band 2 ± eps (closed form for x^2 / 4 + 1). */
const preimage = (eps: number): Interval[] => {
  const hi = 2 * Math.sqrt(1 + eps)
  const lo = eps < 1 ? 2 * Math.sqrt(1 - eps) : -hi
  // f(2) = 3 is in the band only when eps > 1.
  return eps > 1
    ? [{ from: lo, to: hi }]
    : [
        { from: lo, to: A },
        { from: A, to: hi },
      ]
}

/** f where it leaves the band, NaN elsewhere: the parts of the graph that escape. */
const escaping = (g: (x: number) => number, center: number, eps: number) => (x: number) => {
  const y = g(x)
  return Math.abs(y - center) >= eps ? y : NaN
}

export default function EpsilonDelta() {
  const { id } = useVizStep()
  const [eps, setEps] = useVizParam<number>('eps', 0.5)
  const [delta, setDelta] = useVizParam<number>('delta', 0.8)
  const [claim, setClaim] = useVizParam<number>('L', 1.75)
  const seq = useSequence()

  useStepEffect({
    band: () => void seq.run(({ tween }) => tween(1.2, 0.5, { duration: 2, onUpdate: setEps })),
    window: () => {
      setEps(0.5)
      void seq.run(({ tween }) => tween(0.9, 0.35, { duration: 2.4, onUpdate: setDelta }))
    },
    game: () =>
      void seq.run(async ({ tween, wait }) => {
        let from = 1
        setEps(from)
        for (const to of [0.5, 0.25, 0.1]) {
          await wait(1)
          await tween(from, to, { duration: 1.2, onUpdate: setEps })
          from = to
        }
      }),
    sides: () => {
      seq.cancel()
      setEps(0.5)
    },
    jump: () => {
      setEps(0.5)
      setClaim(1.75)
      void seq.run(({ tween }) => tween(0.8, 0.1, { duration: 2.4, onUpdate: setDelta }))
    },
    infinity: () =>
      void seq.run(({ tween }) => tween(1.5, 0.4, { duration: 2.4, onUpdate: setEps })),
  })
  const stop = () => seq.cancel()

  const onJump = id === 'jump'
  const best = largestDelta(f, A, L, eps, 3)
  const jumpBest = largestDelta(jump, A, claim, eps, 3)
  const N = thresholdN(wiggle, L, eps, FAR)

  // The window step tests the learner's delta; the game and sides steps use the largest one.
  const shownDelta =
    id === 'window' || onJump ? delta : id === 'game' || id === 'sides' ? best.delta : undefined
  const g = onJump ? jump : f
  const center = onJump ? claim : L
  const works =
    shownDelta !== undefined &&
    largestDelta(g, A, center, eps, Math.max(shownDelta, 1e-6)).delta >= shownDelta - 1e-9

  const domain =
    id === 'infinity'
      ? { x: [-1, 30] as const, y: [-1, 9] as const }
      : { x: [-0.5, 4.5] as const, y: [-0.5, 4] as const }
  const gridStep = id === 'infinity' ? 2 : 1

  return (
    <>
      <Stage
        zoomable
        domain={domain}
        ariaLabel="A graph with a band of height epsilon around the limit and a window of width delta around the point"
        overlay={
          <Overlay corner="top-left">
            {id === 'band' && (
              <ReadoutPanel title="Band">
                <Readout label="$\varepsilon$" value={fmt(eps, 3)} color={vc.teal} />
                <Readout
                  label="inputs that land in it"
                  value={`$(${fmt(preimage(eps)[0]!.from, 3)}, ${fmt(preimage(eps).at(-1)!.to, 3)})$`}
                  color={vc.yellow}
                  hint={
                    eps > 1
                      ? 'With $\\varepsilon > 1$ even $f(2) = 3$ lands in the band.'
                      : 'Except $x = 2$ itself, whose value $3$ is outside the band. The definition never looks at it.'
                  }
                />
              </ReadoutPanel>
            )}
            {(id === 'window' || id === 'game') && (
              <ReadoutPanel title="Window">
                <Readout label="$\varepsilon$" value={fmt(eps, 3)} color={vc.teal} />
                <Readout label="$\delta$" value={fmt(shownDelta!, 3)} color={vc.yellow} />
                <Readout
                  label="all outputs in the band"
                  value={works ? 'yes' : 'no'}
                  hint="Checked for every $x$ with $0 < |x - 2| < \delta$."
                />
                <Readout
                  label="largest $\delta$ that works"
                  value={fmt(best.delta, 3)}
                  hint="Any smaller $\delta$ works too. The definition asks for one, not the best."
                />
              </ReadoutPanel>
            )}
            {id === 'sides' && (
              <ReadoutPanel title="Each side">
                <Readout label="$\varepsilon$" value={fmt(eps, 3)} color={vc.teal} />
                <Readout label="$\delta_\text{left}$" value={fmt(best.left, 3)} />
                <Readout label="$\delta_\text{right}$" value={fmt(best.right, 3)} />
                <Readout
                  label="$\delta = \min$"
                  value={fmt(best.delta, 3)}
                  color={vc.yellow}
                  hint="Here $\delta_\text{right} = 2\sqrt{1 + \varepsilon} - 2$, from solving $\frac{x^2}{4} + 1 = 2 + \varepsilon$."
                />
              </ReadoutPanel>
            )}
            {onJump && (
              <ReadoutPanel title="Claimed limit">
                <Readout label="$L$" value={fmt(claim, 2)} color={vc.teal} />
                <Readout label="$\varepsilon$" value={fmt(eps, 2)} color={vc.teal} />
                <Readout label="$\delta$" value={fmt(delta, 3)} color={vc.yellow} />
                <Readout label="this $\delta$ works" value={works ? 'yes' : 'no'} />
                <Readout
                  label="some $\delta$ works"
                  value={jumpBest.delta > 0 ? 'yes' : 'no'}
                  hint="Left values are near $1$, right values near $2.5$. Both fit in the band only if $\varepsilon > |L - 1|$ and $\varepsilon > |L - 2.5|$, which needs $\varepsilon > 0.75$."
                />
              </ReadoutPanel>
            )}
            {id === 'infinity' && (
              <ReadoutPanel title="Threshold">
                <Readout label="$\varepsilon$" value={fmt(eps, 3)} color={vc.teal} />
                <Readout
                  label="smallest $N$"
                  value={fmt(N, 2)}
                  color={vc.yellow}
                  hint="The last $x$ where the graph touches the edge of the band. Past it, $|f(x) - 2| \le \frac{6}{x} < \varepsilon$ once $x > \frac{6}{\varepsilon}$, so $N \le \frac{6}{\varepsilon}$."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid step={gridStep} />
        <Axes step={gridStep} />

        <Band axis="y" from={center - eps} to={center + eps} color={vc.teal} />

        {id !== 'infinity' && (
          <>
            {shownDelta !== undefined && (
              <Band axis="x" from={A - shownDelta} to={A + shownDelta} color={vc.yellow} />
            )}
            {id === 'band' && <AxisInterval set={preimage(eps)} axis="x" color={vc.yellow} />}
            {id === 'sides' && (
              <>
                <Segment
                  from={[A - best.left, 0]}
                  to={[A, 0]}
                  color={vc.yellow}
                  width={4}
                  opacity={0.45}
                />
                <Segment from={[A, 0]} to={[A + best.right, 0]} color={vc.yellow} width={4} />
                <MathLabel
                  at={[A - best.left / 2, 0]}
                  tex="\delta_\text{left}"
                  anchor="n"
                  offset={10}
                  color={vc.muted}
                />
                <MathLabel
                  at={[A + best.right / 2, 0]}
                  tex="\delta_\text{right}"
                  anchor="n"
                  offset={10}
                  color={vc.yellow}
                />
              </>
            )}

            <FunctionPlot
              f={onJump ? jump : curve}
              breaks={onJump ? [A] : undefined}
              color={vc.blue}
              opacity={shownDelta === undefined ? 1 : 0.45}
            />
            {shownDelta !== undefined && (
              <>
                <FunctionPlot
                  f={onJump ? jump : curve}
                  breaks={onJump ? [A] : undefined}
                  domain={[A - shownDelta, A + shownDelta]}
                  color={vc.blue}
                  width={3.5}
                />
                <FunctionPlot
                  f={escaping(onJump ? jump : curve, center, eps)}
                  breaks={onJump ? [A] : undefined}
                  domain={[A - shownDelta, A + shownDelta]}
                  color={vc.fg}
                  width={4}
                  dash="2 4"
                />
              </>
            )}
            {onJump ? (
              <>
                <Point at={[A, 1]} color={vc.blue} hollow coords={false} />
                <Point at={[A, 2.5]} color={vc.blue} />
                <MathLabel at={[0, claim]} tex="L" anchor="e" offset={12} color={vc.teal} />
                <Point
                  at={[0, claim]}
                  color={vc.teal}
                  label="L"
                  onDrag={([, py]) => {
                    stop()
                    setClaim(clamp(py, 0, 3.5))
                  }}
                />
              </>
            ) : (
              <>
                <Point at={[A, L]} color={vc.blue} hollow coords={false} />
                <Point at={[A, 3]} color={vc.blue} />
                <MathLabel at={[0, L]} tex="L" anchor="e" offset={10} color={vc.teal} />
              </>
            )}
            <MathLabel at={[A, 0]} tex="a" anchor="s" offset={18} color={vc.muted} />
          </>
        )}

        {id === 'infinity' && (
          <>
            <Band axis="x" from={N} to={10 * FAR} color={vc.yellow} />
            <FunctionPlot f={wiggle} samples={1200} color={vc.blue} />
            <FunctionPlot
              f={escaping(wiggle, L, eps)}
              samples={1200}
              color={vc.fg}
              width={4}
              dash="2 4"
            />
            {N > 0 && <Point at={[N, wiggle(N)]} color={vc.yellow} r={5} coords={false} />}
            <MathLabel at={[N, 0]} tex="N" anchor="s" offset={18} color={vc.yellow} />
          </>
        )}
      </Stage>

      <VizControls>
        {id !== 'window' && (
          <LabeledSlider
            label="$\varepsilon$"
            value={eps}
            onChange={(v) => {
              stop()
              setEps(v)
            }}
            min={id === 'infinity' ? 0.2 : 0.05}
            max={id === 'infinity' ? 2 : 1.5}
            step={0.01}
            format={(v) => fmt(v, 2)}
            color={vc.teal}
          />
        )}
        {(id === 'window' || onJump) && (
          <LabeledSlider
            label="$\delta$"
            value={delta}
            onChange={(v) => {
              stop()
              setDelta(v)
            }}
            min={0.02}
            max={1.5}
            step={0.01}
            format={(v) => fmt(v, 2)}
            color={vc.yellow}
          />
        )}
      </VizControls>
    </>
  )
}
