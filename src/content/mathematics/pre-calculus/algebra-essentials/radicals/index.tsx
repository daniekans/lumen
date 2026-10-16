import { useState } from 'react'
import { fmt, range, type Vec2 } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Grid,
  MathLabel,
  Path,
  Segment,
  Stage,
  Overlay,
  useAnimatedValue,
  useStepEffect,
  useVizStep,
  VizControls,
} from '@/viz-kit'

/** Axis-aligned square with its lower-left corner at `at`. */
const square = (at: Vec2, s: number): Vec2[] => [
  at,
  [at[0] + s, at[1]],
  [at[0] + s, at[1] + s],
  [at[0], at[1] + s],
]

/** √n as TeX: exact for perfect squares, otherwise with an approximation. */
const rootTex = (n: number, index = 2) => {
  const r = n ** (1 / index)
  const exact = Math.round(r)
  const root = index === 2 ? `\\sqrt{${n}}` : `\\sqrt[${index}]{${n}}`
  return exact ** index === n ? `${root} = ${exact}` : `${root} \\approx ${fmt(r)}`
}

const int = (v: number) => String(Math.round(v))
const SQUARE_FREE = ['2', '3', '5'] as const
type R = (typeof SQUARE_FREE)[number]

export default function Radicals() {
  const { id } = useVizStep()
  const [area, setArea] = useState(20)
  const [k, setK] = useState(3)
  const [r, setR] = useState<R>('2')
  const [a, setA] = useState(9)
  const [b, setB] = useState(16)
  const [volume, setVolume] = useState(27)

  useStepEffect({
    side: () => setArea(20),
    simplify: () => {
      setK(3)
      setR('2')
    },
    sum: () => {
      setA(9)
      setB(16)
    },
    cube: () => setVolume(27),
  })

  const isSquareStep = id === 'side' || id === 'simplify'
  const n = k * k * Number(r)
  const blueTarget =
    id === 'side' ? Math.sqrt(area) : id === 'simplify' ? Math.sqrt(n) : Math.sqrt(a)
  const [s1, s2, s3, edge] = useAnimatedValue(
    [
      id === 'cube' ? 0 : blueTarget,
      id === 'sum' ? Math.sqrt(b) : 0,
      id === 'sum' ? Math.sqrt(a + b) : 0,
      id === 'cube' ? Math.cbrt(volume) : 0,
    ],
    { duration: 0.6 },
  )
  const squareOpacity = useAnimatedValue(id === 'cube' ? 0 : 1, { duration: 0.4 })
  const sumOpacity = useAnimatedValue(id === 'sum' ? 1 : 0, { duration: 0.5 })
  const cubeOpacity = useAnimatedValue(id === 'cube' ? 1 : 0, { duration: 0.5 })
  const gridLines = useAnimatedValue(
    range(3).map((i) => (id === 'simplify' && i < k - 1 ? 1 : 0)),
    { duration: 0.4 },
  )

  // Oblique cube: the back face is offset up and to the right.
  const d = edge * 0.38
  const front = square([0, 0], edge)
  const top: Vec2[] = [
    [0, edge],
    [edge, edge],
    [edge + d, edge + d],
    [d, edge + d],
  ]
  const right: Vec2[] = [
    [edge, 0],
    [edge + d, d],
    [edge + d, edge + d],
    [edge, edge],
  ]

  const small = s1 / k
  const simplest = `\\sqrt{${n}} = ${k === 1 ? '' : k}\\sqrt{${r}}`
  const blueLabel =
    id === 'side' ? String(area) : id === 'simplify' ? String(r) : id === 'sum' ? String(a) : ''

  return (
    <>
      <Stage
        domain={{ x: [-0.5, 10.5], y: [-0.9, 9.4] }}
        ariaLabel="Squares and a cube whose sides are square and cube roots of their areas and volume"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {id === 'side' && (
                <Readout label="side" value={<Tex>{rootTex(area)}</Tex>} color={vc.blue} />
              )}
              {id === 'simplify' && (
                <>
                  <Readout
                    label="area"
                    value={<Tex>{`${n} = ${k}^2 \\cdot ${r}`}</Tex>}
                    color={vc.blue}
                  />
                  <Readout label="side" value={<Tex>{simplest}</Tex>} color={vc.blue} />
                </>
              )}
              {id === 'sum' && (
                <>
                  <Readout
                    label="$\sqrt{a} + \sqrt{b}$"
                    value={fmt(Math.sqrt(a) + Math.sqrt(b))}
                    color={vc.yellow}
                  />
                  <Readout label="$\sqrt{a + b}$" value={fmt(Math.sqrt(a + b))} color={vc.teal} />
                </>
              )}
              {id === 'cube' && (
                <>
                  <Readout label="volume" value={volume} color={vc.blue} />
                  <Readout label="edge" value={<Tex>{rootTex(volume, 3)}</Tex>} color={vc.blue} />
                </>
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />

        {/* The blue square: area A, k²r, or a. */}
        <g style={{ opacity: squareOpacity }}>
          <Path
            points={square([0, 0], s1)}
            closed
            color={vc.blue}
            width={2}
            fill={alpha(vc.blue, 0.16)}
          />
          {range(3).map((i) => (
            <g key={i}>
              <Segment
                from={[small * (i + 1), 0]}
                to={[small * (i + 1), s1]}
                color={vc.blue}
                width={1.25}
                opacity={gridLines[i]! * 0.8}
              />
              <Segment
                from={[0, small * (i + 1)]}
                to={[s1, small * (i + 1)]}
                color={vc.blue}
                width={1.25}
                opacity={gridLines[i]! * 0.8}
              />
            </g>
          ))}
        </g>
        <MathLabel
          at={id === 'simplify' ? [small / 2, small / 2] : [s1 / 2, s1 / 2]}
          tex={blueLabel}
          color={vc.blue}
          opacity={squareOpacity}
        />
        {isSquareStep && (
          <MathLabel
            at={[s1 / 2, 0]}
            tex={id === 'side' ? rootTex(area) : simplest}
            color={vc.blue}
            anchor="s"
            offset={12}
          />
        )}

        {/* Two squares side by side, and the square with their combined area. */}
        <g style={{ opacity: sumOpacity }}>
          <Path
            points={square([s1, 0], s2)}
            closed
            color={vc.yellow}
            width={2}
            fill={alpha(vc.yellow, 0.16)}
          />
          <Path points={square([0, 0], s3)} closed color={vc.teal} width={2} dash="6 6" />
        </g>
        {id === 'sum' && (
          <>
            {/* Between the dashed side and the right edge, so the dashed line never crosses it. */}
            <MathLabel at={[(s3 + s1 + s2) / 2, s2 / 2]} tex={String(b)} color={vc.yellow} />
            <MathLabel
              at={[(s1 + s2) / 2, 0]}
              tex={`\\sqrt{${a}} + \\sqrt{${b}} \\approx ${fmt(s1 + s2)}`}
              color={vc.yellow}
              anchor="s"
              offset={12}
            />
            <MathLabel
              at={[s3 / 2, s3]}
              tex={`\\sqrt{${a} + ${b}} \\approx ${fmt(s3)}`}
              color={vc.teal}
              anchor="n"
              offset={10}
            />
          </>
        )}

        {/* The cube of volume V. */}
        <g style={{ opacity: cubeOpacity }}>
          <Path points={top} closed color={vc.blue} width={2} fill={alpha(vc.blue, 0.26)} />
          <Path points={right} closed color={vc.blue} width={2} fill={alpha(vc.blue, 0.08)} />
          <Path points={front} closed color={vc.blue} width={2} fill={alpha(vc.blue, 0.16)} />
        </g>
        {id === 'cube' && (
          <>
            <MathLabel at={[edge / 2, edge / 2]} tex={`V = ${volume}`} color={vc.blue} />
            <MathLabel
              at={[edge / 2, 0]}
              tex={`${rootTex(volume, 3)}`}
              color={vc.blue}
              anchor="s"
              offset={12}
            />
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'side' && (
          <LabeledSlider
            label="area $A$"
            value={area}
            onChange={(v) => setArea(Math.round(v))}
            min={0}
            max={64}
            step={1}
            format={int}
            color={vc.blue}
          />
        )}
        {id === 'simplify' && (
          <>
            <LabeledSlider
              label="$k$"
              value={k}
              onChange={(v) => setK(Math.round(v))}
              min={1}
              max={4}
              step={1}
              format={int}
              color={vc.blue}
            />
            <SegmentedControl
              label="$r$"
              value={r}
              onChange={setR}
              options={SQUARE_FREE.map((v) => ({ value: v, label: v }))}
            />
          </>
        )}
        {id === 'sum' && (
          <>
            <LabeledSlider
              label="$a$"
              value={a}
              onChange={(v) => setA(Math.round(v))}
              min={1}
              max={25}
              step={1}
              format={int}
              color={vc.blue}
            />
            <LabeledSlider
              label="$b$"
              value={b}
              onChange={(v) => setB(Math.round(v))}
              min={1}
              max={25}
              step={1}
              format={int}
              color={vc.yellow}
            />
          </>
        )}
        {id === 'cube' && (
          <LabeledSlider
            label="volume $V$"
            value={volume}
            onChange={(v) => setVolume(Math.round(v))}
            min={0}
            max={64}
            step={1}
            format={int}
            color={vc.blue}
          />
        )}
      </VizControls>
    </>
  )
}
