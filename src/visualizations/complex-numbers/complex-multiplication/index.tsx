import { useState } from 'react'
import { cAbs, cArg, cFormat, cMul, complex, cPolar, type Complex, type Vec2 } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { Button, Divider } from '@/ui/atoms'
import { Readout, ReadoutPanel, ToggleField } from '@/ui/molecules'
import {
  Arc,
  Axes,
  Grid,
  MathLabel,
  Overlay,
  Path,
  Point,
  Stage,
  useSequence,
  useStepEffect,
  Vector,
  VizControls,
} from '@/viz-kit'

const Z = vc.blue
const W = vc.yellow
const ZW = vc.teal

const toVec = (c: Complex): Vec2 => [c.re, c.im]

/** Rounds to 0.05 and snaps to whole numbers when close, so dragged points land on tidy values. */
const snap = ([x, y]: Vec2): Complex => {
  const s = (v: number) =>
    Math.abs(v - Math.round(v)) < 0.12 ? Math.round(v) : Math.round(v * 20) / 20
  return complex(s(x), s(y))
}

/** Angle in degrees, normalized to [0, 360). */
const deg = (rad: number) => {
  const d = ((((rad * 180) / Math.PI) % 360) + 360) % 360
  return `${d.toFixed(1)}°`
}

/** w raised to a real power t, following the spiral from 1 to w. */
const wPow = (w: Complex, t: number) => cPolar(cAbs(w) ** t, cArg(w) * t)

const GRID_RANGE = 8

export default function ComplexMultiplication() {
  const [z, setZ] = useState(complex(2, 1))
  const [w, setW] = useState(complex(1, 1))
  // Progress of the product animation: rotation first, then scaling.
  const [rot, setRot] = useState(1)
  const [sc, setSc] = useState(1)
  const [showProduct, setShowProduct] = useState(true)
  const [plane, setPlane] = useState(false)
  const [planeT, setPlaneT] = useState(0)
  const product = useSequence()
  const planeSeq = useSequence()

  const zw = cMul(z, w)

  const multiply = (phase: 'all' | 'rotate' | 'scale' = 'all') =>
    product.run(async ({ tween, wait }) => {
      setShowProduct(true)
      if (phase !== 'scale') {
        setSc(0)
        setRot(0)
        await wait(0.2)
        await tween(0, 1, { duration: 1.2, onUpdate: setRot })
      }
      if (phase === 'rotate') return
      setRot(1)
      if (phase === 'all') await wait(0.25)
      await tween(0, 1, { duration: 1, onUpdate: setSc })
    })

  const setPlaneOn = (on: boolean) => {
    setPlane(on)
    planeSeq.run(({ tween }) =>
      tween(planeT, on ? 1 : 0, { duration: on ? 1.8 : 0.8, onUpdate: setPlaneT }),
    )
  }

  useStepEffect({
    numbers: () => {
      product.cancel()
      setShowProduct(false)
      setPlaneOn(false)
    },
    rotate: () => {
      setPlaneOn(false)
      multiply('rotate')
    },
    scale: () => {
      setPlaneOn(false)
      multiply('scale')
    },
    plane: () => {
      product.cancel()
      setShowProduct(true)
      setRot(1)
      setSc(1)
      setPlaneOn(true)
    },
  })

  const finishProduct = () => {
    product.cancel()
    setRot(1)
    setSc(1)
  }

  // The animated arrow: z turned by rot * arg(w), stretched from |z| toward |z||w|.
  const moving = cPolar(cAbs(z) * (1 + sc * (cAbs(w) - 1)), cArg(z) + rot * cArg(w))
  const wt = wPow(w, planeT)
  const map = (x: number, y: number) => toVec(cMul(complex(x, y), wt))
  const lines = Array.from({ length: 2 * GRID_RANGE + 1 }, (_, i) => i - GRID_RANGE)

  return (
    <>
      <Stage
        domain={{ x: [-3.6, 3.6], y: [-1.4, 3.6] }}
        ariaLabel="Complex plane showing z, w and their product"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout label="$z$" value={cFormat(z)} color={Z} />
              <Readout label="$w$" value={cFormat(w)} color={W} />
              <Readout label="$zw$" value={cFormat(zw)} color={ZW} />
              <Readout label="$|z|\,|w|$" value={(cAbs(z) * cAbs(w)).toFixed(3)} />
              <Readout label="$|zw|$" value={cAbs(zw).toFixed(3)} />
              <Readout label="$\arg z + \arg w$" value={deg(cArg(z) + cArg(w))} />
              <Readout label="$\arg zw$" value={deg(cArg(zw))} />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid opacity={1 - planeT * 0.6} />
        <Axes labelLimit={GRID_RANGE} />

        {planeT > 0.001 && (
          <g style={{ opacity: Math.min(1, planeT * 4) }}>
            {lines.map((k) => (
              <g key={k}>
                <Path
                  points={[map(k, -GRID_RANGE), map(k, GRID_RANGE)]}
                  color={vc.fg}
                  width={k === 0 ? 1.5 : 0.75}
                  opacity={k === 0 ? 0.6 : 0.28}
                />
                <Path
                  points={[map(-GRID_RANGE, k), map(GRID_RANGE, k)]}
                  color={vc.fg}
                  width={k === 0 ? 1.5 : 0.75}
                  opacity={k === 0 ? 0.6 : 0.28}
                />
              </g>
            ))}
            <Path
              points={[map(0, 0), map(1, 0), map(1, 1), map(0, 1)]}
              closed
              color={W}
              width={1.5}
              fill={alpha(W, 0.18)}
            />
            <Point at={map(z.re, z.im)} color={ZW} r={5} />
          </g>
        )}

        <Arc r={0.45} from={0} to={cArg(z)} color={Z} width={1.5} opacity={0.8} />
        <Arc r={0.7} from={0} to={cArg(w)} color={W} width={1.5} opacity={0.8} />

        <Point at={[1, 0]} color={vc.fg} r={4} />

        {showProduct && (
          <>
            <Arc
              r={1}
              from={0}
              to={cArg(z) + rot * cArg(w)}
              color={ZW}
              width={1.5}
              opacity={0.6}
              dash="3 4"
            />
            <Vector to={toVec(moving)} color={ZW} />
            <MathLabel
              at={toVec(moving)}
              tex="zw"
              color={ZW}
              anchor={moving.re >= 0 ? 'ne' : 'nw'}
            />
          </>
        )}

        <Vector to={toVec(w)} color={W} />
        <Vector to={toVec(z)} color={Z} />
        <MathLabel at={toVec(w)} tex="w" color={W} anchor={w.re >= 0 ? 'se' : 'sw'} />
        <MathLabel at={toVec(z)} tex="z" color={Z} anchor={z.re >= 0 ? 'se' : 'sw'} />
        <Point
          at={toVec(w)}
          color={W}
          r={5}
          onDrag={(p) => {
            finishProduct()
            setW(snap(p))
          }}
          label="w"
        />
        <Point
          at={toVec(z)}
          color={Z}
          r={5}
          onDrag={(p) => {
            finishProduct()
            setZ(snap(p))
          }}
          label="z"
        />
      </Stage>

      <VizControls>
        <Button variant="primary" onClick={() => multiply('all')} disabled={product.running}>
          Multiply z by w
        </Button>
        <Divider />
        <ToggleField label="Transform the plane" checked={plane} onChange={setPlaneOn} color={W} />
      </VizControls>
    </>
  )
}
