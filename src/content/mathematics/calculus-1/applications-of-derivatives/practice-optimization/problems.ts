import { defineProblems, tex } from '@/lib/practice'

const { frac, num, poly } = tex

/** A decimal without trailing zeros: 0.250 -> '0.25'. */
const dec = (v: number, digits = 4) => String(Number(v.toFixed(digits)))

/** Sheets whose best cut is a tidy number: W^2 - WH + H^2 is a perfect square. */
const SHEETS = [
  [5, 8],
  [10, 16],
  [15, 24],
  [9, 24],
  [8, 15],
  [16, 30],
  [12, 12],
  [18, 18],
  [30, 30],
] as const

/** Points whose closest distance to the curve is tidy, and a few where the end of the domain wins. */
const OFFSETS = [1.25, 2.5, 4.25, 6.5, 9.25] as const
const NEAR = [0.2, 0.3, 0.4] as const

export const problems = defineProblems([
  {
    id: 'fence',
    title: 'Largest pen',
    skills: ['optimization'],
    difficulty: 1,
    generate: (rng) => {
      const river = rng.bool()
      // The constraint a x + b y = L, with x the sides perpendicular to the river or the dividers.
      const k = river ? 0 : rng.int(1, 2)
      const a = river ? 2 : k + 2
      const b = river ? 1 : 2
      const L = 4 * a * b * rng.pick([5, 10, 15, 20, 25])
      const x = L / (2 * a)
      const value = (L * L) / (4 * a * b)
      const setting = river
        ? `A farmer has $${L}$ m of fence for a rectangular pen along a straight river. The side on the river needs no fence.`
        : `A farmer has $${L}$ m of fence for a rectangular pen, split into $${k + 1}$ parts by $${k}$ ${k === 1 ? 'fence' : 'fences'} parallel to two of its sides.`
      return {
        prompt: `${setting} What is the largest area the pen can have, in square meters?`,
        answer: { kind: 'number', value },
        hints: [
          `Let $x$ be the length of the sides ${river ? 'perpendicular to the river' : 'parallel to the dividers'} and $y$ the other side. The fence gives $${a}x + ${b === 1 ? '' : b}y = ${L}$.`,
          `Solve for $y$, write the area $A = xy$ in $x$ alone, and keep $x$ in $[0, ${frac(L, a)}]$.`,
        ],
        solution: [
          `$y = ${b === 1 ? `${L} - ${a}x` : `\\frac{${L} - ${a}x}{${b}}`}$, so $A(x) = ${b === 1 ? `${L}x - ${a}x^2` : `\\frac{${L}x - ${a}x^2}{${b}}`}$ on $[0, ${frac(L, a)}]$.`,
          `$A'(x) = 0$ at $x = ${num(x)}$. Both ends give $A = 0$, so the maximum is there: $y = ${num(L / (2 * b))}$ and $A = ${num(value)}\\ \\text{m}^2$.`,
        ],
        data: { a, b, L },
      }
    },
  },
  {
    id: 'box',
    title: 'Open box from a sheet',
    skills: ['optimization'],
    difficulty: 2,
    generate: (rng) => {
      const [W, H] = rng.pick(SHEETS)
      const disc = Math.sqrt(W * W - W * H + H * H)
      const x = (W + H - disc) / 6
      const big = (W + H + disc) / 6
      const V = x * (W - 2 * x) * (H - 2 * x)
      const sheet = W === H ? `a $${W}$ by $${W}$ cm square` : `a $${W}$ by $${H}$ cm rectangle`
      return {
        prompt: `An open box is made from ${sheet} of cardboard by cutting a square of side $x$ from each corner and folding up the sides. Which $x$, in centimeters, gives the largest volume?`,
        answer: { kind: 'number', value: x, tolerance: 0.002 },
        hints: [
          `$V(x) = x(${W} - 2x)(${H} - 2x)$, and $x$ lies in $[0, ${frac(Math.min(W, H), 2)}]$.`,
          `$V'(x) = ${poly([12, -4 * (W + H), W * H])}$. Keep only the root inside the interval.`,
        ],
        solution: [
          `$V'(x) = ${poly([12, -4 * (W + H), W * H])} = 0$ at $x = ${num(x)}$ and $x = ${num(big)}$.`,
          `$${num(big)}$ is outside $[0, ${frac(Math.min(W, H), 2)}]$. The ends give $V = 0$, so $x = ${num(x)}$ cm, with $V = ${num(V, 27)}\\ \\text{cm}^3$.`,
        ],
        data: { W, H },
      }
    },
  },
  {
    id: 'can',
    title: 'Can with the least metal',
    skills: ['optimization'],
    difficulty: 2,
    generate: (rng) => {
      const V = rng.pick([250, 330, 500, 1000])
      const open = rng.int(0, 2) === 0
      const disks = open ? 1 : 2
      const r = Math.cbrt(V / (disks * Math.PI))
      const h = V / (Math.PI * r * r)
      const what = open
        ? 'An open cylindrical container (a bottom, no lid)'
        : 'A closed cylindrical can (a bottom and a lid)'
      return {
        prompt: `${what} must hold $${V}\\ \\text{cm}^3$. Which radius, in centimeters, uses the least material? Give it to two decimal places.`,
        answer: { kind: 'number', value: r, tolerance: 0.006 },
        hints: [
          `The material is $A = ${disks === 1 ? '' : '2'}\\pi r^2 + 2\\pi r h$ and the volume gives $\\pi r^2 h = ${V}$.`,
          `Substitute $h = \\frac{${V}}{\\pi r^2}$: $A(r) = ${disks === 1 ? '' : '2'}\\pi r^2 + \\frac{${2 * V}}{r}$ for $r > 0$.`,
        ],
        solution: [
          `$A'(r) = ${2 * disks}\\pi r - \\frac{${2 * V}}{r^2} = 0$ gives $r^3 = \\frac{${V / disks}}{\\pi}$, so $r = \\sqrt[3]{\\frac{${V / disks}}{\\pi}} \\approx ${dec(r, 2)}$ cm.`,
          `$A' < 0$ before it and $A' > 0$ after it, and $A \\to \\infty$ at both edges of $(0, \\infty)$, so it is the minimum. Then $h \\approx ${dec(h, 2)}$ cm${open ? ', equal to $r$' : ', twice $r$'}.`,
        ],
        data: { V, disks },
      }
    },
  },
  {
    id: 'closest-point',
    title: 'Closest point on a curve',
    skills: ['optimization'],
    difficulty: 3,
    generate: (rng) => {
      const parabola = rng.bool()
      const atEnd = rng.int(0, 3) === 0
      const p = atEnd ? rng.pick(NEAR) : rng.pick(OFFSETS)
      const value = atEnd ? p : Math.sqrt(p - 0.25)
      const point = parabola ? `(0, ${p})` : `(${p}, 0)`
      const curve = parabola ? 'y = x^2' : 'y = \\sqrt{x}'
      const D2 = parabola ? `x^2 + (x^2 - ${p})^2` : `(x - ${p})^2 + x`
      const u = parabola ? 'u = x^2' : 'x'
      return {
        prompt: `What is the smallest distance from the point $${point}$ to the curve $${curve}$?`,
        answer: { kind: 'number', value, tolerance: 0.001 },
        hints: [
          'Minimize the squared distance $D^2$: it has the same minimizer as $D$ and no square root.',
          parabola
            ? `$D^2 = ${D2}$. With $u = x^2 \\ge 0$ this is $u + (u - ${p})^2$; check $u = 0$ as well.`
            : `$D^2 = ${D2}$ for $x \\ge 0$; check the end $x = 0$ as well.`,
        ],
        solution: atEnd
          ? [
              `$\\frac{d}{d${parabola ? 'u' : 'x'}}D^2 = 2(${parabola ? 'u' : 'x'} - ${p}) + 1 = 0$ at $${parabola ? 'u' : 'x'} = ${dec(p - 0.5)}$, outside the domain $${parabola ? 'u' : 'x'} \\ge 0$.`,
              `$D^2$ increases on the whole domain, so the minimum is at the end $x = 0$: the point $(0, 0)$, at distance $${p}$.`,
            ]
          : [
              `$\\frac{d}{d${parabola ? 'u' : 'x'}}D^2 = 2(${parabola ? 'u' : 'x'} - ${p}) + 1 = 0$ at $${u} = ${dec(p - 0.5)}$, inside the domain.`,
              `There $D^2 = ${dec(p - 0.5)} + \\frac{1}{4} = ${dec(p - 0.25)}$, smaller than at the end ($${dec(p * p)}$), so $D = ${dec(value)}$.`,
            ],
        data: { parabola: parabola ? 1 : 0, p },
      }
    },
  },
  {
    id: 'profit',
    title: 'Best price',
    skills: ['optimization'],
    difficulty: 2,
    generate: (rng) => {
      const k = rng.pick([2, 4, 5, 10])
      const top = rng.pick([40, 60, 80, 100])
      const c = rng.pick([10, 20])
      const Q = k * top
      const best = (top + c) / 2
      const capped = rng.int(0, 2) === 0
      const cap = capped ? best - rng.int(3, 8) : 0
      const value = capped ? cap : best
      const rule = capped ? ` A regulation caps the price at $${cap}$ dollars.` : ''
      return {
        prompt: `A shop sells $q = ${Q} - ${k}p$ units a week at a price of $p$ dollars, and each unit costs it $${c}$ dollars.${rule} Which price gives the largest weekly profit, in dollars?`,
        answer: { kind: 'number', value },
        hints: [
          `Profit is $P(p) = (p - ${c})(${Q} - ${k}p)$, with $p$ in $[${c}, ${capped ? cap : top}]$.`,
          capped
            ? "Find where $P'(p) = 0$, then check whether it lies inside the allowed interval."
            : "Find where $P'(p) = 0$ and compare with the ends.",
        ],
        solution: [
          `$P'(p) = (${Q} - ${k}p) - ${k}(p - ${c}) = ${Q + k * c} - ${2 * k}p = 0$ at $p = ${num(best)}$.`,
          capped
            ? `$${num(best)}$ is above the cap, and $P' > 0$ on $[${c}, ${cap}]$, so $P$ increases all the way to the end: the best price is $${cap}$ dollars.`
            : `$P = 0$ at both ends $p = ${c}$ and $p = ${top}$, so the best price is $${num(best)}$ dollars.`,
        ],
        data: { Q, k, c, cap },
      }
    },
  },
  {
    id: 'least-squares',
    title: 'Least squares of a constant',
    skills: ['optimization'],
    difficulty: 1,
    generate: (rng) => {
      const n = rng.int(4, 6)
      const ys = Array.from({ length: n }, () => rng.int(0, 20))
      const mean = ys.reduce((s, y) => s + y, 0) / n
      const S = ys.reduce((s, y) => s + (y - mean) ** 2, 0)
      const askMin = rng.int(0, 2) === 0
      const list = ys.join(', ')
      const data: Record<string, number> = { n, askMin: askMin ? 1 : 0 }
      ys.forEach((y, i) => (data[`y${i}`] = y))
      return {
        prompt: askMin
          ? `For the data $${list}$, what is the smallest value of $S(c) = \\sum (y_i - c)^2$?`
          : `For the data $${list}$, which $c$ makes $S(c) = \\sum (y_i - c)^2$ as small as possible?`,
        answer: { kind: 'number', value: askMin ? S : mean, tolerance: 1e-6 },
        hints: [
          "$S'(c) = -2\\sum (y_i - c)$. Set it to $0$ and solve for $c$.",
          '$S$ is a parabola in $c$ that opens upward, so its one critical point is the minimum.',
        ],
        solution: [
          `$S'(c) = 0$ gives $c = \\bar{y} = \\frac{${ys.reduce((s, y) => s + y, 0)}}{${n}} = ${num(mean)}$.`,
          ...(askMin
            ? [
                `$S(${num(mean)}) = ${ys.map((y) => `(${num(y - mean)})^2`).join(' + ')} = ${num(S, 36)}$.`,
              ]
            : []),
        ],
        data,
      }
    },
  },
])
