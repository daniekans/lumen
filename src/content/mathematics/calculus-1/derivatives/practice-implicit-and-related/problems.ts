import { defineProblems, tex, type Rng } from '@/lib/practice'

const { poly, sum, paren, frac, term } = tex

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

/** x^k as TeX, with x^1 written x and x^0 empty. */
const pow = (v: string, k: number) => (k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`)

/** p/q times `body` as one fraction: '-\\frac{3x^{2}}{2y}', '\\frac{x}{y}'. */
const fracOf = (p: number, q: number, top: string, bottom: string) => {
  const g = gcd(p, q) * Math.sign(q)
  const [n, d] = [p / g, q / g]
  const bot = term(d, bottom || '1')
  const topTex = term(Math.abs(n), top || '1')
  return `${n < 0 ? '-' : ''}${bot === '1' ? topTex : `\\frac{${topTex}}{${bot}}`}`
}

/**
 * A point (x0, y0) and a k for the curve x² + kxy + y² = c through it, with c > 0 and a slope
 * that is defined there.
 */
const curvePoint = (rng: Rng) => {
  for (;;) {
    const x0 = rng.nonZeroInt(-3, 3)
    const y0 = rng.nonZeroInt(-3, 3)
    const k = rng.nonZeroInt(-3, 3)
    if (k * x0 + 2 * y0 !== 0 && x0 * x0 + k * x0 * y0 + y0 * y0 > 0) return { x0, y0, k }
  }
}

/** A point on x² + kxy + y² = c (c > 0) where dx/dy is defined: 2x + ky ≠ 0. */
const dxdyPoint = (rng: Rng) => {
  for (;;) {
    const x0 = rng.nonZeroInt(-3, 3)
    const y0 = rng.nonZeroInt(-3, 3)
    const k = rng.nonZeroInt(-3, 3)
    if (2 * x0 + k * y0 !== 0 && x0 * x0 + k * x0 * y0 + y0 * y0 > 0) return { x0, y0, k }
  }
}

/**
 * A point with a vertical tangent (kx + 2y = 0) on x² + kxy + y² = c. With |k| < 2 the curve is an
 * ellipse (c > 0) and 2x + ky ≠ 0 there; x is even so that y = -kx/2 is whole.
 */
const verticalPoint = (rng: Rng) => {
  const k = rng.int(-1, 1)
  const x0 = rng.pick([-4, -2, 2, 4])
  return { x0, y0: -(k * x0) / 2, k }
}

/** Right triangles with whole sides: legs and hypotenuse. */
const TRIPLES: readonly (readonly [number, number, number])[] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
]

/** '= 1.8', or '= \\frac{5}{3} \\approx 1.67' when the value is not a short decimal. */
const approx = (v: number) => {
  const exact = tex.num(v, 30)
  if (Math.abs(+v.toFixed(2) - v) < 1e-9) return `= ${+v.toFixed(2)}`
  return exact.startsWith('\\frac')
    ? `= ${exact} \\approx ${v.toFixed(2)}`
    : `\\approx ${v.toFixed(2)}`
}

/** Positions (east, north) of the two cars, with the distance between them, in km. */
const CAR_TRIPLES: readonly (readonly [number, number, number])[] = [
  [6, 8, 10],
  [8, 6, 10],
  [12, 16, 20],
  [16, 12, 20],
  [12, 5, 13],
  [15, 8, 17],
  [9, 12, 15],
  [20, 15, 25],
  [24, 7, 25],
]

export const problems = defineProblems([
  {
    id: 'implicit-slope',
    title: 'Slope on an implicit curve',
    skills: ['implicit-differentiation'],
    difficulty: 2,
    generate: (rng) => {
      const { x0, y0, k } = curvePoint(rng)
      const c = x0 * x0 + k * x0 * y0 + y0 * y0
      const top = 2 * x0 + k * y0
      const bottom = k * x0 + 2 * y0
      const curve = `x^{2} ${k < 0 ? '-' : '+'} ${term(Math.abs(k), 'xy')} + y^{2} = ${c}`
      return {
        prompt: `Find $\\frac{dy}{dx}$ at the point $(${x0}, ${y0})$ on the curve $${curve}$.`,
        answer: { kind: 'number', value: -top / bottom },
        hints: [
          `Differentiate both sides in $x$. The middle term needs the product rule: $\\frac{d}{dx}(xy) = y + x\\,\\frac{dy}{dx}$.`,
          `You should get $2x ${k < 0 ? '-' : '+'} ${term(Math.abs(k), 'y')} + (${sum([
            [k, 'x'],
            [2, 'y'],
          ])})\\frac{dy}{dx} = 0$.`,
        ],
        solution: [
          `$2x + ${paren(k)}\\left(y + x\\,\\frac{dy}{dx}\\right) + 2y\\,\\frac{dy}{dx} = 0$, so $\\frac{dy}{dx} = -\\frac{${sum(
            [
              [2, 'x'],
              [k, 'y'],
            ],
          )}}{${sum([
            [k, 'x'],
            [2, 'y'],
          ])}}$.`,
          `At $(${x0}, ${y0})$: $\\frac{dy}{dx} = -\\frac{${top}}{${bottom}} = ${frac(-top, bottom)}$.`,
        ],
        data: { x0, y0, k, c },
      }
    },
  },
  {
    id: 'dx-dy',
    title: 'Differentiate in y',
    skills: ['implicit-differentiation'],
    difficulty: 2,
    generate: (rng) => {
      // A third of the time, a point with a vertical tangent, where dy/dx fails but dx/dy = 0.
      const vertical = rng.int(0, 2) === 0
      const { x0, y0, k } = vertical ? verticalPoint(rng) : dxdyPoint(rng)
      const c = x0 * x0 + k * x0 * y0 + y0 * y0
      const top = k * x0 + 2 * y0
      const bottom = 2 * x0 + k * y0
      const curve =
        k === 0
          ? `x^{2} + y^{2} = ${c}`
          : `x^{2} ${k < 0 ? '-' : '+'} ${term(Math.abs(k), 'xy')} + y^{2} = ${c}`
      return {
        prompt: `Find $\\frac{dx}{dy}$ at the point $(${x0}, ${y0})$ on the curve $${curve}$.${vertical ? ' (The tangent there is vertical, so $\\frac{dy}{dx}$ does not exist.)' : ''}`,
        answer: { kind: 'number', value: -top / bottom },
        hints: [
          `Differentiate both sides in $y$, with $x$ a function of $y$: $\\frac{d}{dy}\\left(x^2\\right) = 2x\\,\\frac{dx}{dy}$.${k === 0 ? '' : ' The middle term needs the product rule: $\\frac{d}{dy}(xy) = \\frac{dx}{dy}\\,y + x$.'}`,
          `Collect the terms with $\\frac{dx}{dy}$ and solve for it.`,
        ],
        solution: [
          k === 0
            ? '$2x\\,\\frac{dx}{dy} + 2y = 0$, so $\\frac{dx}{dy} = -\\frac{y}{x}$.'
            : `$2x\\,\\frac{dx}{dy} + ${paren(k)}\\left(\\frac{dx}{dy}\\,y + x\\right) + 2y = 0$, so $\\frac{dx}{dy} = -\\frac{${sum(
                [
                  [k, 'x'],
                  [2, 'y'],
                ],
              )}}{${sum([
                [2, 'x'],
                [k, 'y'],
              ])}}$.`,
          `At $(${x0}, ${y0})$: $\\frac{dx}{dy} = -\\frac{${top}}{${bottom}} = ${frac(-top, bottom)}$.`,
        ],
        data: { x0, y0, k, c },
      }
    },
  },
  {
    id: 'implicit-derivative',
    title: 'Implicit derivative',
    skills: ['implicit-differentiation'],
    difficulty: 2,
    generate: (rng) => {
      const m = rng.int(2, 4)
      const n = rng.int(2, 3)
      const a = rng.nonZeroInt(-4, 4)
      const b = rng.nonZeroInt(-4, 4)
      const c = rng.int(1, 12)
      const answer = fracOf(-a * m, b * n, pow('x', m - 1), pow('y', n - 1))
      const lhs = sum([
        [a, pow('x', m)],
        [b, pow('y', n)],
      ])
      return {
        prompt: `Find $\\frac{dy}{dx}$ on the curve $${lhs} = ${c}$, in terms of $x$ and $y$.`,
        answer: { kind: 'expression', tex: answer, ranges: { x: [0.5, 2], y: [0.5, 2] } },
        hints: [
          `$\\frac{d}{dx}\\left(y^{${n}}\\right) = ${n}${pow('y', n - 1)}\\,\\frac{dy}{dx}$ by the chain rule.`,
          'Move the term without $\\frac{dy}{dx}$ to the other side and divide.',
        ],
        solution: [
          `$${term(a * m, pow('x', m - 1))} + ${term(b * n, pow('y', n - 1))}\\,\\frac{dy}{dx} = 0$.`.replace(
            '+ -',
            '- ',
          ),
          `$\\frac{dy}{dx} = ${answer}$.`,
        ],
        data: { m, n, a, b, c },
      }
    },
  },
  {
    id: 'tangent-implicit',
    title: 'Tangent to an ellipse',
    skills: ['implicit-differentiation'],
    difficulty: 3,
    generate: (rng) => {
      const a = rng.int(1, 4)
      const b = rng.int(1, 4)
      const x0 = rng.nonZeroInt(-3, 3)
      const y0 = rng.nonZeroInt(-3, 3)
      const c = a * x0 * x0 + b * y0 * y0
      // slope p/q = -(a x0)/(b y0); line y = (p x + (y0 q - p x0)) / q
      const g = gcd(a * x0, b * y0) * Math.sign(b * y0)
      const p = -(a * x0) / g
      const q = (b * y0) / g
      const r = y0 * q - p * x0
      const line = q === 1 ? poly([p, r]) : `\\frac{${poly([p, r])}}{${q}}`
      return {
        prompt: `Find the tangent line to $${term(a, 'x^{2}')} + ${term(b, 'y^{2}')} = ${c}$ at $(${x0}, ${y0})$. Enter the right side of $y = mx + b$.`,
        answer: { kind: 'expression', tex: line },
        hints: [
          `Implicit differentiation gives $\\frac{dy}{dx} = -\\frac{${term(a, 'x')}}{${term(b, 'y')}}$.`,
          'Then use the point-slope form $y = y_0 + m(x - x_0)$.',
        ],
        solution: [
          `$${term(2 * a, 'x')} + ${term(2 * b, 'y')}\\,\\frac{dy}{dx} = 0$, so $\\frac{dy}{dx} = -\\frac{${term(a, 'x')}}{${term(b, 'y')}}$.`,
          `At $(${x0}, ${y0})$: $m = ${frac(p, q)}$.`,
          `$y = ${y0} + ${frac(p, q).startsWith('-') ? `\\left(${frac(p, q)}\\right)` : frac(p, q)}(x - ${paren(x0)}) = ${line}$.`,
        ],
        data: { a, b, x0, y0, c },
      }
    },
  },
  {
    id: 'inverse-derivative',
    title: 'Slope of an inverse',
    skills: ['implicit-differentiation'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.int(1, 4)
      const b = rng.int(-5, 5)
      const x0 = rng.int(-2, 2)
      const y0 = x0 ** 3 + a * x0 + b
      const slope = 3 * x0 * x0 + a
      return {
        prompt: `The function $f(x) = ${poly([1, 0, a, b])}$ is increasing, so it has an inverse $g$. Find $g'(${y0})$.`,
        answer: { kind: 'number', value: 1 / slope },
        hints: [
          `First find the $a$ with $f(a) = ${y0}$: try small whole numbers.`,
          "$g'(f(a)) = \\frac{1}{f'(a)}$.",
        ],
        solution: [
          `$f(${x0}) = ${y0}$, so $g(${y0}) = ${x0}$.`,
          `$f'(x) = ${poly([3, 0, a])}$, so $f'(${x0}) = ${slope}$.`,
          `$g'(${y0}) = \\frac{1}{f'(${x0})} = ${frac(1, slope)}$.`,
        ],
        data: { a, b, x0 },
      }
    },
  },
  {
    id: 'inverse-trig',
    title: 'Arctangent and arcsine',
    skills: ['implicit-differentiation', 'chain-rule'],
    difficulty: 2,
    generate: (rng) => {
      const kind = rng.int(0, 2)
      const k = rng.int(2, 5)
      const ft = ['\\arctan(' + k + 'x)', '\\arcsin(' + k + 'x)', '\\arctan\\left(x^{2}\\right)'][
        kind
      ]!
      const answer = [
        `\\frac{${k}}{1 + ${k * k}x^{2}}`,
        `\\frac{${k}}{\\sqrt{1 - ${k * k}x^{2}}}`,
        '\\frac{2x}{1 + x^{4}}',
      ][kind]!
      const inner = kind === 2 ? 'x^{2}' : `${k}x`
      const outer =
        kind === 1
          ? '\\frac{d}{du}\\arcsin u = \\frac{1}{\\sqrt{1 - u^2}}'
          : '\\frac{d}{du}\\arctan u = \\frac{1}{1 + u^2}'
      const bound = 0.8 / k
      return {
        prompt: `Find $f'(x)$ for $f(x) = ${ft}$.`,
        answer: {
          kind: 'expression',
          tex: answer,
          ranges: { x: kind === 1 ? [-bound, bound] : [-2, 2] },
        },
        hints: [`$${outer}$.`, `Use the chain rule with $u = ${inner}$.`],
        solution: [`$${outer}$ and $u' = ${kind === 2 ? '2x' : k}$.`, `$f'(x) = ${answer}$.`],
        data: { kind, k },
      }
    },
  },
  {
    id: 'log-differentiation',
    title: 'Logarithmic differentiation',
    skills: ['implicit-differentiation'],
    difficulty: 3,
    generate: (rng) => {
      const sine = rng.bool()
      const k = rng.int(1, 4)
      const kx = term(k, 'x')
      const ft = sine ? 'x^{\\sin x}' : `x^{${kx}}`
      const answer = sine
        ? 'x^{\\sin x}\\left(\\cos x \\ln x + \\frac{\\sin x}{x}\\right)'
        : `${k === 1 ? '' : k}x^{${kx}}(\\ln x + 1)`
      return {
        prompt: `Find $f'(x)$ for $f(x) = ${ft}$, where $x > 0$.`,
        answer: { kind: 'expression', tex: answer, ranges: { x: [0.5, 2.5] } },
        hints: [
          `Take logarithms: $\\ln f(x) = ${sine ? '\\sin x' : kx} \\cdot \\ln x$.`,
          "Differentiate both sides: the left side gives $\\frac{f'(x)}{f(x)}$.",
        ],
        solution: sine
          ? [
              '$\\ln f = \\sin x \\ln x$.',
              "$\\frac{f'}{f} = \\cos x \\ln x + \\frac{\\sin x}{x}$ by the product rule.",
              `$f'(x) = ${answer}$.`,
            ]
          : [
              `$\\ln f = ${kx} \\ln x$.`,
              `$\\frac{f'}{f} = ${k === 1 ? '' : k}\\ln x + ${kx} \\cdot \\frac{1}{x} = ${k === 1 ? '' : k}(\\ln x + 1)$.`,
              `$f'(x) = ${answer}$.`,
            ],
        data: { sine: Number(sine), k },
      }
    },
  },
  {
    id: 'ladder',
    title: 'Sliding ladder',
    skills: ['related-rates'],
    difficulty: 2,
    generate: (rng) => {
      const [p, q, L] = rng.pick(TRIPLES)
      const [x0, y0] = rng.bool() ? [p, q] : [q, p]
      const v = rng.pick([0.5, 1, 2, 3])
      const value = (-x0 * v) / y0
      return {
        prompt: `A ladder $${L}$ meters long leans against a wall. Its foot slides away from the wall at $${v}$ meters per second. How fast is the top moving when the foot is $${x0}$ meters from the wall? Give the rate in meters per second, negative if the top falls.`,
        answer: { kind: 'number', value },
        hints: [
          `With $x$ the foot's distance and $y$ the top's height, $x^2 + y^2 = ${L * L}$ at every moment.`,
          'Differentiate in $t$: $2x\\,\\frac{dx}{dt} + 2y\\,\\frac{dy}{dt} = 0$.',
        ],
        solution: [
          `When $x = ${x0}$, $y = \\sqrt{${L * L} - ${x0 * x0}} = ${y0}$.`,
          `$\\frac{dy}{dt} = -\\frac{x}{y}\\,\\frac{dx}{dt} = -\\frac{${x0}}{${y0}} \\cdot ${v} = ${tex.num(value)}$ meters per second.`,
        ],
        data: { x0, y0, v },
      }
    },
  },
  {
    id: 'shadow',
    title: 'A walking shadow',
    skills: ['related-rates'],
    difficulty: 2,
    generate: (rng) => {
      const h = rng.pick([1.5, 1.6, 1.8, 2])
      const r = rng.pick([2, 2.5, 3, 4])
      const H = r * h
      const v = rng.pick([1, 1.2, 1.5, 2])
      const d = rng.int(3, 15)
      const tip = rng.bool()
      // s = (H / (H - h)) x, and the length s - x = (h / (H - h)) x
      const factor = tip ? H / (H - h) : h / (H - h)
      const value = factor * v
      const f = (n: number) => String(+n.toFixed(4))
      const q = tex.num(factor)
      return {
        prompt: `A person $${h}$ meters tall walks away from a streetlight $${f(H)}$ meters high at $${v}$ meters per second. How fast is ${tip ? 'the tip of the shadow moving' : 'the length of the shadow growing'} when the person is $${d}$ meters from the light? Give the rate in meters per second.`,
        answer: { kind: 'number', value, tolerance: 0.005 },
        hints: [
          `With $x$ the person's distance and $s$ the tip's distance from the pole, similar triangles give $\\frac{s}{${f(H)}} = \\frac{s - x}{${h}}$ at every moment.`,
          `Solve for $s$ in terms of $x$, then differentiate in $t$.${tip ? '' : ' The length is $s - x$.'}`,
        ],
        solution: [
          `$${h}s = ${f(H)}(s - x)$, so $s = ${tex.num(H / (H - h))}x$${tip ? '' : ` and the length is $s - x = ${tex.num(h / (H - h))}x$`}.`,
          `$\\frac{d}{dt}${tip ? 's' : '(s - x)'} = ${q} \\cdot ${v} ${approx(value)}$ meters per second. The distance $${d}$ is not needed: the relation is linear.`,
        ],
        data: { h, H, v, d, tip: Number(tip) },
      }
    },
  },
  {
    id: 'two-cars',
    title: 'Two cars',
    skills: ['related-rates'],
    difficulty: 3,
    generate: (rng) => {
      for (;;) {
        const [x, y, D] = rng.pick(CAR_TRIPLES)
        const minutes = rng.pick([6, 9, 12, 15, 30])
        const t = minutes / 60
        const a = x / t
        const b = rng.pick([30, 40, 50, 60, 80])
        const y0 = y - b * t
        if (!Number.isInteger(a) || a < 30 || a > 120 || y0 < 0 || !Number.isInteger(y0)) continue
        const value = (x * a + y * b) / D
        const start =
          y0 === 0
            ? `car B leaves the same crossing heading north at $${b}$ km/h`
            : `car B is $${y0}$ km north of the crossing, heading north at $${b}$ km/h`
        return {
          prompt: `Car A leaves a crossing heading east at $${a}$ km/h. At the same moment ${start}. How fast is the distance between the cars growing $${minutes}$ minutes later? Give the rate in km/h.`,
          answer: { kind: 'number', value, tolerance: 0.005 },
          hints: [
            'With $x$ and $y$ the distances from the crossing, the distance $D$ between the cars satisfies $D^2 = x^2 + y^2$ at every moment.',
            'Differentiate in $t$: $2D\\,\\frac{dD}{dt} = 2x\\,\\frac{dx}{dt} + 2y\\,\\frac{dy}{dt}$. Work out $x$, $y$ and $D$ at the instant first.',
          ],
          solution: [
            `After $${minutes}$ minutes, $${tex.num(t)}$ hours: $x = ${a} \\cdot ${tex.num(t)} = ${x}$, $y = ${y0 === 0 ? '' : `${y0} + `}${b} \\cdot ${tex.num(t)} = ${y}$, and $D = \\sqrt{${x * x} + ${y * y}} = ${D}$.`,
            `$\\frac{dD}{dt} = \\frac{${x} \\cdot ${a} + ${y} \\cdot ${b}}{${D}} ${approx(value)}$ km/h.`,
          ],
          data: { a, b, y0, t },
        }
      }
    },
  },
  {
    id: 'cone',
    title: 'Filling a cone',
    skills: ['related-rates'],
    difficulty: 3,
    generate: (rng) => {
      const R = rng.int(2, 4)
      const H = rng.pick([4, 6, 8, 10, 12])
      const h0 = rng.int(2, H - 1)
      const q = rng.int(1, 6)
      const value = (q * H * H) / (R * R * h0 * h0)
      return {
        prompt: `Water flows at $${term(q, '\\pi')}$ cubic meters per minute into a conical tank, tip down, with top radius $${R}$ meters and height $${H}$ meters. How fast is the water level rising, in meters per minute, when the water is $${h0}$ meters deep?`,
        answer: { kind: 'number', value },
        hints: [
          `By similar triangles the surface radius is $r = ${frac(R, H)}h$.`,
          `So $V = \\frac{1}{3}\\pi r^2 h = ${frac(R * R, 3 * H * H)}\\pi h^3$. Differentiate in $t$.`,
        ],
        solution: [
          `$V = ${frac(R * R, 3 * H * H)}\\pi h^3$, so $\\frac{dV}{dt} = ${frac(R * R, H * H)}\\pi h^2\\,\\frac{dh}{dt}$.`,
          `At $h = ${h0}$: $${term(q, '\\pi')} = ${frac(R * R * h0 * h0, H * H)}\\pi\\,\\frac{dh}{dt}$, so $\\frac{dh}{dt} = ${frac(q * H * H, R * R * h0 * h0)}$ meters per minute.`,
        ],
        data: { R, H, h0, q },
      }
    },
  },
  {
    id: 'growing-circle-or-sphere',
    title: 'Growing circle or sphere',
    skills: ['related-rates'],
    difficulty: 2,
    generate: (rng) => {
      const sphere = rng.bool()
      const r0 = rng.int(2, 10)
      if (!sphere) {
        const v = rng.int(1, 5)
        return {
          prompt: `A ripple spreads in a circle whose radius grows at $${v}$ centimeters per second. How fast is the area inside it growing when the radius is $${r0}$ centimeters? Give the rate in square centimeters per second.`,
          answer: {
            kind: 'number',
            value: 2 * Math.PI * r0 * v,
            tolerance: 2e-3 * Math.PI * r0 * v,
          },
          hints: [
            '$A = \\pi r^2$ at every moment.',
            'Differentiate in $t$: $\\frac{dA}{dt} = 2\\pi r\\,\\frac{dr}{dt}$.',
          ],
          solution: [
            `$\\frac{dA}{dt} = 2\\pi \\cdot ${r0} \\cdot ${v} = ${2 * r0 * v}\\pi$ square centimeters per second.`,
          ],
          data: { sphere: 0, r0, v, Q: 0 },
        }
      }
      const Q = rng.pick([10, 20, 50, 100])
      return {
        prompt: `Air is pumped into a spherical balloon at $${Q}$ cubic centimeters per second. How fast is the radius growing when it is $${r0}$ centimeters? Give the rate in centimeters per second.`,
        answer: {
          kind: 'number',
          value: Q / (4 * Math.PI * r0 * r0),
          tolerance: Q / (4000 * Math.PI * r0 * r0),
        },
        hints: [
          '$V = \\frac{4}{3}\\pi r^3$ at every moment.',
          'Differentiate in $t$: $\\frac{dV}{dt} = 4\\pi r^2\\,\\frac{dr}{dt}$.',
        ],
        solution: [
          `$${Q} = 4\\pi \\cdot ${r0 * r0}\\,\\frac{dr}{dt}$, so $\\frac{dr}{dt} = \\frac{${frac(Q, 4 * r0 * r0)}}{\\pi}$ centimeters per second.`.replace(
            /\\frac\{\\frac\{(\d+)\}\{(\d+)\}\}\{\\pi\}/,
            '\\frac{$1}{$2\\pi}',
          ),
        ],
        data: { sphere: 1, r0, v: 0, Q },
      }
    },
  },
  {
    id: 'angle-of-elevation',
    title: 'Angle of elevation',
    skills: ['related-rates'],
    difficulty: 3,
    generate: (rng) => {
      const d = rng.int(2, 10)
      const h0 = rng.int(1, 12)
      const v = rng.int(1, 5)
      const value = (v * d) / (d * d + h0 * h0)
      return {
        prompt: `A balloon rises straight up at $${v}$ meters per second from a point $${d}$ meters from an observer. How fast is the angle of elevation $\\theta$ changing when the balloon is $${h0}$ meters up? Give the rate in radians per second.`,
        answer: { kind: 'number', value },
        hints: [
          `$\\tan\\theta = \\frac{h}{${d}}$ at every moment.`,
          `Differentiate in $t$: $\\frac{1}{\\cos^2\\theta}\\,\\frac{d\\theta}{dt} = \\frac{1}{${d}}\\,\\frac{dh}{dt}$. At the instant, $\\cos\\theta = \\frac{${d}}{\\sqrt{${d * d} + ${h0 * h0}}}$.`,
        ],
        solution: [
          `$\\cos^2\\theta = \\frac{${d * d}}{${d * d + h0 * h0}}$ when $h = ${h0}$.`,
          `$\\frac{d\\theta}{dt} = \\cos^2\\theta \\cdot \\frac{${v}}{${d}} = \\frac{${d * d}}{${d * d + h0 * h0}} \\cdot \\frac{${v}}{${d}} = ${frac(v * d, d * d + h0 * h0)}$ radians per second.`,
        ],
        data: { d, h0, v },
      }
    },
  },
])
