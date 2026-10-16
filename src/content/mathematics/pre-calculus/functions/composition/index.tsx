import { useState } from 'react'
import { clamp, fmt, lerp, linspace, range } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  MathLabel,
  Overlay,
  Point,
  Segment,
  Stage,
  TextLabel,
  useAnimatedValue,
  useStepEffect,
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

const g = (x: number) => x + 1
const f = (u: number) => u * u

const LINE: [number, number] = [-4, 8]
/** Heights of the three number lines: input, middle value, output. */
const Y0 = 0
const Y1 = 2.3
const Y2 = 4.6
const X_MIN = -2.5
const X_MAX = 1.8
const fan = linspace(-2, 1.5, 8)

type Order = 'fg' | 'gf'

function NumberLine({ y, opacity = 1 }: { y: number; opacity?: number }) {
  return (
    <g style={{ opacity }}>
      <Segment from={[LINE[0], y]} to={[LINE[1], y]} color={vc.axis} width={1.25} />
      {range(LINE[1] - LINE[0] + 1).map((i) => {
        const v = LINE[0] + i
        return (
          <g key={v}>
            <Segment from={[v, y - 0.08]} to={[v, y + 0.08]} color={vc.axis} width={1} />
            <TextLabel at={[v, y - 0.32]} size={10.5} mono>
              {String(v)}
            </TextLabel>
          </g>
        )
      })}
    </g>
  )
}

/** Arrow between two number lines, from value a on the lower line to value b on the upper one. */
const Hop = ({
  a,
  b,
  y,
  dy,
  color,
  opacity = 1,
  width = 2,
}: {
  a: number
  b: number
  y: number
  dy: number
  color: string
  opacity?: number
  width?: number
}) => (
  <Vector
    from={[a, y + 0.14]}
    to={[b, y + dy - 0.14]}
    color={color}
    width={width}
    head={9}
    opacity={opacity}
  />
)

export default function Composition() {
  const { id } = useVizStep()
  const [x, setX] = useState(1)
  const [order, setOrder] = useState<Order>('fg')

  const mix = useAnimatedValue(order === 'gf' ? 1 : 0, { duration: 1.2 })
  const fanOpacity = useAnimatedValue(id === 'many' || id === 'order' ? 1 : 0, { duration: 0.6 })
  const direct = useAnimatedValue(id === 'direct' ? 1 : 0, { duration: 0.9 })

  useStepEffect({
    chain: () => {
      setOrder('fg')
      setX(1)
    },
    many: () => setOrder('fg'),
    order: () => {
      setOrder('gf')
      setX(1)
    },
    direct: () => setOrder('fg'),
  })

  // Values on the middle and top lines, blended between the two orders.
  const mid = (v: number) => lerp(g(v), f(v), mix)
  const top = (v: number) => lerp(f(g(v)), g(f(v)), mix)
  const first = order === 'fg' ? 'g' : 'f'
  const second = order === 'fg' ? 'f' : 'g'
  const firstColor = order === 'fg' ? vc.teal : vc.blue
  const secondColor = order === 'fg' ? vc.blue : vc.teal
  const xm = mid(x)
  const xt = top(x)

  return (
    <>
      <Stage
        domain={{ x: [-5.8, 8.6], y: [-0.9, 5.4] }}
        ariaLabel="Three number lines showing an input, its image under g, and the image of that under f"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout label="$x$" value={fmt(x)} color={vc.yellow} />
              <Readout label={`$${first}(x)$`} value={fmt(xm)} color={firstColor} />
              <Readout label={`$${second}(${first}(x))$`} value={fmt(xt)} color={secondColor} />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <NumberLine y={Y0} />
        <NumberLine y={Y1} opacity={1 - direct * 0.85} />
        <NumberLine y={Y2} />
        <MathLabel at={[LINE[0] - 0.2, Y0]} tex="x" anchor="w" />
        <MathLabel
          at={[LINE[0] - 0.2, Y1]}
          tex={`${first}(x)`}
          anchor="w"
          color={firstColor}
          opacity={1 - direct * 0.85}
        />
        <MathLabel
          at={[LINE[0] - 0.2, Y2]}
          tex={`${second}(${first}(x))`}
          anchor="w"
          color={secondColor}
        />

        {/* The fan: many inputs, each with its own two arrows. */}
        {fan.map((v) => (
          <g key={v}>
            <Hop
              a={v}
              b={mid(v)}
              y={Y0}
              dy={Y1 - Y0}
              color={firstColor}
              width={1.25}
              opacity={fanOpacity * 0.55}
            />
            <Hop
              a={mid(v)}
              b={top(v)}
              y={Y1}
              dy={Y2 - Y1}
              color={secondColor}
              width={1.25}
              opacity={fanOpacity * 0.55}
            />
          </g>
        ))}

        {/* The tracked input. */}
        <Hop a={x} b={xm} y={Y0} dy={Y1 - Y0} color={firstColor} opacity={1 - direct} />
        <Hop a={xm} b={xt} y={Y1} dy={Y2 - Y1} color={secondColor} opacity={1 - direct} />
        <Hop a={x} b={xt} y={Y0} dy={Y2 - Y0} color={secondColor} opacity={direct} />
        <g style={{ opacity: 1 - direct }}>
          <Point at={[xm, Y1]} color={firstColor} r={5} />
        </g>
        <Point at={[xt, Y2]} color={secondColor} r={5.5} />
        <MathLabel
          at={[(x + xm) / 2 - 0.1, (Y0 + Y1) / 2]}
          tex={first}
          color={firstColor}
          anchor="w"
          offset={8}
          opacity={1 - direct}
        />
        <MathLabel
          at={[(xm + xt) / 2 - 0.1, (Y1 + Y2) / 2]}
          tex={second}
          color={secondColor}
          anchor="w"
          offset={8}
          opacity={1 - direct}
        />
        <MathLabel
          at={[(x + xt) / 2 - 0.1, (Y0 + Y2) / 2]}
          tex={`${second} \\circ ${first}`}
          color={secondColor}
          anchor="w"
          offset={8}
          opacity={direct}
        />
        <Point
          at={[x, Y0]}
          color={vc.yellow}
          r={6.5}
          onDrag={([v]) => setX(Math.round(clamp(v, X_MIN, X_MAX) * 100) / 100)}
          label="x"
        />
      </Stage>

      <VizControls>
        <LabeledSlider
          label="$x$"
          value={x}
          onChange={setX}
          min={X_MIN}
          max={X_MAX}
          step={0.01}
          color={vc.yellow}
        />
        <SegmentedControl
          label="Order"
          value={order}
          onChange={setOrder}
          options={[
            { value: 'fg', label: 'f(g(x))' },
            { value: 'gf', label: 'g(f(x))' },
          ]}
        />
      </VizControls>
    </>
  )
}
