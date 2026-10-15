export type Vec2 = readonly [number, number]

export const vec = (x: number, y: number): Vec2 => [x, y]
export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]]
export const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]]
export const scale = (a: Vec2, k: number): Vec2 => [a[0] * k, a[1] * k]
export const dot = (a: Vec2, b: Vec2) => a[0] * b[0] + a[1] * b[1]
export const cross = (a: Vec2, b: Vec2) => a[0] * b[1] - a[1] * b[0]
export const length = (a: Vec2) => Math.hypot(a[0], a[1])
export const angle = (a: Vec2) => Math.atan2(a[1], a[0])
export const fromPolar = (r: number, theta: number): Vec2 => [
  r * Math.cos(theta),
  r * Math.sin(theta),
]
export const lerpVec = (a: Vec2, b: Vec2, t: number): Vec2 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
]
export const normalize = (a: Vec2): Vec2 => {
  const l = length(a)
  return l === 0 ? [0, 0] : [a[0] / l, a[1] / l]
}
export const distance = (a: Vec2, b: Vec2) => length(sub(a, b))
