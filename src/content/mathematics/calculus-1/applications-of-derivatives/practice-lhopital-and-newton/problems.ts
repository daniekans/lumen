import { defineProblems, tex } from '@/lib/practice'

const { frac, num, poly, term } = tex

/** A decimal without trailing zeros: 0.250 -> '0.25'. */
const dec = (v: number, digits = 6) => String(Number(v.toFixed(digits)))

/** `ax` in TeX, with the coefficient dropped when it is 1. */
const ax = (a: number) => term(a, 'x')

/** Newton's iterates for f with derivative df, from x0, n steps. */
const iterate = (f: (x: number) => number, df: (x: number) => number, x0: number, n: number) => {
  const xs = [x0]
  for (let k = 0; k < n; k++) {
    const x = xs[k]!
    xs.push(x - f(x) / df(x))
  }
  return xs
}

/** Problem data as a plain record, for branches that store different parameters. */
const rec = (o: Record<string, number>): Readonly<Record<string, number>> => o

const BEHAVIORS = [
  'It converges to a root',
  'It cycles between two values',
  'It moves away from the root, farther each step',
  'It stops: the tangent at $x_0$ is flat',
] as const

export const problems = defineProblems([
  {
    id: 'zero-over-zero',
    title: 'Zero over zero',
    skills: ['lhopital'],
    difficulty: 2,
    generate: (rng) => {
      const fam = rng.int(0, 3)
      if (fam === 0) {
        const a = rng.int(1, 5)
        const b = rng.int(1, 5)
        return {
          prompt: `Find $\\lim_{x \\to 0} \\frac{e^{${ax(a)}} - 1}{\\sin ${ax(b)}}$.`,
          answer: { kind: 'number', value: a / b },
          hints: [
            'Substitute $x = 0$: both the top and the bottom are $0$.',
            'Differentiate the top and the bottom separately, then substitute.',
          ],
          solution: [
            'At $x = 0$ the form is $\\frac{0}{0}$, so the rule applies.',
            `$\\lim_{x \\to 0} \\frac{${term(a, `e^{${ax(a)}}`)}}{${term(b, `\\cos ${ax(b)}`)}} = ${frac(a, b)}$.`,
          ],
          data: rec({ fam, a, b }),
        }
      }
      if (fam === 1) {
        const a = rng.int(1, 6)
        return {
          prompt: `Find $\\lim_{x \\to 0} \\frac{1 - \\cos ${ax(a)}}{x^2}$.`,
          answer: { kind: 'number', value: (a * a) / 2 },
          hints: [
            'The form is $\\frac{0}{0}$. After one use of the rule it is still $\\frac{0}{0}$.',
            'Use the rule twice, checking the form each time.',
          ],
          solution: [
            `$\\frac{0}{0}$; the rule gives $\\lim_{x \\to 0} \\frac{${term(a, `\\sin ${ax(a)}`)}}{2x}$, again $\\frac{0}{0}$.`,
            `Once more: $\\lim_{x \\to 0} \\frac{${term(a * a, `\\cos ${ax(a)}`)}}{2} = ${frac(a * a, 2)}$.`,
          ],
          data: rec({ fam, a }),
        }
      }
      if (fam === 2) {
        const k = rng.int(2, 6)
        return {
          prompt: `Find $\\lim_{x \\to 1} \\frac{\\ln x}{x^{${k}} - 1}$.`,
          answer: { kind: 'number', value: 1 / k },
          hints: ['At $x = 1$ both the top and the bottom are $0$.'],
          solution: [
            'The form is $\\frac{0}{0}$.',
            `The rule gives $\\lim_{x \\to 1} \\frac{1/x}{${k}x^{${k - 1}}} = \\frac{1}{${k}}$.`,
          ],
          data: rec({ fam, k }),
        }
      }
      const a = rng.int(1, 3)
      return {
        prompt: `Find $\\lim_{x \\to 0} \\frac{\\sin ${ax(a)} - ${ax(a)}}{x^3}$.`,
        answer: { kind: 'number', value: -(a ** 3) / 6 },
        hints: [
          'The form stays $\\frac{0}{0}$ for a while: check it after each use of the rule.',
          'Three uses of the rule leave no $x$ in the denominator.',
        ],
        solution: [
          `First use: $\\frac{${term(a, `\\cos ${ax(a)}`)} - ${a}}{3x^2}$, still $\\frac{0}{0}$.`,
          `Second use: $\\frac{${term(-(a * a), `\\sin ${ax(a)}`)}}{6x}$, still $\\frac{0}{0}$.`,
          `Third use: $\\frac{${term(-(a ** 3), `\\cos ${ax(a)}`)}}{6} \\to ${frac(-(a ** 3), 6)}$.`,
        ],
        data: rec({ fam, a }),
      }
    },
  },
  {
    id: 'infinity-over-infinity',
    title: 'Infinity over infinity',
    skills: ['lhopital'],
    difficulty: 2,
    generate: (rng) => {
      const fam = rng.int(0, 2)
      if (fam === 0) {
        const a = rng.int(2, 6)
        return {
          prompt: `Find $\\lim_{x \\to \\infty} \\frac{\\ln(1 + e^{${ax(a)}})}{x}$.`,
          answer: { kind: 'number', value: a },
          hints: [
            'Both the top and the bottom tend to $\\infty$.',
            'After the rule, divide the top and the bottom by the exponential.',
          ],
          solution: [
            'The form is $\\frac{\\infty}{\\infty}$.',
            `The rule gives $\\frac{${a}e^{${ax(a)}}}{1 + e^{${ax(a)}}} = \\frac{${a}}{e^{-${ax(a)}} + 1} \\to ${a}$.`,
          ],
          data: rec({ fam, a }),
        }
      }
      if (fam === 1) {
        const a = rng.int(1, 2)
        const b = rng.int(2, 5)
        return {
          prompt: `Find $\\lim_{x \\to \\infty} \\frac{e^{${ax(a)}} + x^2}{${b}e^{${ax(a)}} - x}$.`,
          answer: { kind: 'number', value: 1 / b },
          hints: [
            'The form is $\\frac{\\infty}{\\infty}$.',
            `Divide the top and the bottom by $e^{${ax(a)}}$; the rule shows $x^2 e^{-${ax(a)}} \\to 0$.`,
          ],
          solution: [
            `Divide by $e^{${ax(a)}}$: $\\frac{1 + x^2 e^{-${ax(a)}}}{${b} - x e^{-${ax(a)}}}$.`,
            `$\\frac{x^2}{e^{${ax(a)}}} \\to 0$ and $\\frac{x}{e^{${ax(a)}}} \\to 0$ (two uses and one use of the rule), so the limit is $\\frac{1}{${b}}$.`,
          ],
          data: rec({ fam, a, b }),
        }
      }
      const n = rng.int(2, 4)
      const a = rng.int(1, 3)
      return {
        prompt: `Find $\\lim_{x \\to \\infty} \\frac{x^{${n}}}{e^{${ax(a)}}}$.`,
        answer: { kind: 'number', value: 0 },
        hints: [`Use the rule ${n} times; each use lowers the power of $x$ by one.`],
        solution: [
          `Each use keeps the form $\\frac{\\infty}{\\infty}$ until the power is gone: after ${n} uses, $\\frac{${n === 2 ? 2 : n === 3 ? 6 : 24}}{${a ** n === 1 ? '' : a ** n}e^{${ax(a)}}} \\to 0$.`,
          'Any power of $x$ grows slower than any exponential $e^{ax}$ with $a > 0$.',
        ],
        data: rec({ fam, n, a }),
      }
    },
  },
  {
    id: 'zero-times-infinity',
    title: 'Zero times infinity',
    skills: ['lhopital'],
    difficulty: 2,
    generate: (rng) => {
      const fam = rng.int(0, 3)
      const a = rng.int(2, 9)
      if (fam === 3) {
        const p = rng.pick([1, 2, 3])
        return {
          prompt: `Find $\\lim_{x \\to 0^+} ${p === 1 ? '' : `x^{${p}}`}${p === 1 ? 'x' : ''} \\ln x$.`,
          answer: { kind: 'number', value: 0 },
          hints: [
            'The form is $0 \\cdot (-\\infty)$. Move a factor to the denominator.',
            `Write it as $\\frac{\\ln x}{x^{-${p}}}$.`,
          ],
          solution: [
            `$\\frac{\\ln x}{x^{-${p}}}$ is $\\frac{-\\infty}{\\infty}$.`,
            `The rule gives $\\frac{1/x}{-${p === 1 ? '' : p}x^{-${p + 1}}} = ${p === 1 ? '-x' : `-\\frac{x^{${p}}}{${p}}`} \\to 0$.`,
          ],
          data: rec({ fam, a, p }),
        }
      }
      const body = [
        `x \\sin \\frac{${a}}{x}`,
        `x \\left(e^{${a}/x} - 1\\right)`,
        `x \\ln\\left(1 + \\frac{${a}}{x}\\right)`,
      ][fam]!
      const quotient = [
        `\\frac{\\sin(${a}/x)}{1/x}`,
        `\\frac{e^{${a}/x} - 1}{1/x}`,
        `\\frac{\\ln(1 + ${a}/x)}{1/x}`,
      ][fam]!
      const after = [`${a}\\cos\\frac{${a}}{x}`, `${a}e^{${a}/x}`, `\\frac{${a}}{1 + ${a}/x}`][fam]!
      return {
        prompt: `Find $\\lim_{x \\to \\infty} ${body}$.`,
        answer: { kind: 'number', value: a },
        hints: [
          'The form is $\\infty \\cdot 0$. Divide by $\\frac{1}{x}$ instead of multiplying by $x$.',
          `The derivative of $\\frac{1}{x}$ is $-\\frac{1}{x^2}$, and the chain rule gives the same factor $-\\frac{${a}}{x^2}$ on top.`,
        ],
        solution: [
          `Rewrite as $${quotient}$, a $\\frac{0}{0}$ form.`,
          `The factors $-\\frac{1}{x^2}$ cancel, leaving $${after} \\to ${a}$.`,
        ],
        data: rec({ fam, a }),
      }
    },
  },
  {
    id: 'infinity-minus-infinity',
    title: 'Infinity minus infinity',
    skills: ['lhopital'],
    difficulty: 3,
    generate: (rng) => {
      const fam = rng.int(0, 2)
      if (fam === 2) {
        const a = rng.int(1, 3)
        return {
          prompt: `Find $\\lim_{x \\to 0} \\left(\\frac{1}{x^2} - \\frac{${a}}{x \\sin ${ax(a)}}\\right)$.`,
          answer: { kind: 'number', value: -(a * a) / 6 },
          hints: [
            'Combine into one fraction.',
            `Split it as $\\frac{\\sin ${ax(a)} - ${ax(a)}}{${a === 1 ? '' : a}x^3} \\cdot \\frac{${ax(a)}}{\\sin ${ax(a)}}$; the second factor tends to $1$.`,
          ],
          solution: [
            `One fraction: $\\frac{\\sin ${ax(a)} - ${ax(a)}}{x^2 \\sin ${ax(a)}} = \\frac{\\sin ${ax(a)} - ${ax(a)}}{${a === 1 ? '' : a}x^3} \\cdot \\frac{${ax(a)}}{\\sin ${ax(a)}}$.`,
            `Three uses of the rule give $\\frac{\\sin ${ax(a)} - ${ax(a)}}{x^3} \\to ${frac(-(a ** 3), 6)}$, so the limit is $${frac(-(a ** 3), 6)} \\cdot \\frac{1}{${a}} \\cdot 1 = ${frac(-(a * a), 6)}$.`,
          ],
          data: rec({ fam, a }),
        }
      }
      const b = rng.int(1, 6)
      const prompt =
        fam === 0
          ? `\\frac{1}{x} - \\frac{${b}}{e^{${ax(b)}} - 1}`
          : `\\frac{${b}}{\\ln(1 + ${ax(b)})} - \\frac{1}{x}`
      const combined =
        fam === 0
          ? `\\frac{e^{${ax(b)}} - 1 - ${ax(b)}}{x\\left(e^{${ax(b)}} - 1\\right)}`
          : `\\frac{${ax(b)} - \\ln(1 + ${ax(b)})}{x \\ln(1 + ${ax(b)})}`
      return {
        prompt: `Find $\\lim_{x \\to 0} \\left(${prompt}\\right)$.`,
        answer: { kind: 'number', value: b / 2 },
        hints: [
          'Both terms blow up. Combine them into one fraction first.',
          'The result is $\\frac{0}{0}$; the rule is needed twice.',
        ],
        solution: [
          `One fraction: $${combined}$, a $\\frac{0}{0}$ form.`,
          fam === 0
            ? `First use: $\\frac{${term(b, `e^{${ax(b)}}`)} - ${b}}{e^{${ax(b)}} - 1 + ${term(b, `xe^{${ax(b)}}`)}}$, still $\\frac{0}{0}$. Second use, at $x = 0$: $\\frac{${b * b}}{${b} + ${b}} = ${frac(b, 2)}$.`
            : `First use: $\\frac{${b} - \\frac{${b}}{1 + ${ax(b)}}}{\\ln(1 + ${ax(b)}) + \\frac{${ax(b)}}{1 + ${ax(b)}}}$, still $\\frac{0}{0}$. Second use, at $x = 0$: $\\frac{${b * b}}{${b} + ${b}} = ${frac(b, 2)}$.`,
        ],
        data: rec({ fam, b }),
      }
    },
  },
  {
    id: 'power-forms',
    title: 'Powers through logarithms',
    skills: ['lhopital'],
    difficulty: 3,
    generate: (rng) => {
      const fam = rng.int(0, 3)
      const a = rng.int(1, 4)
      const b = rng.int(1, 3)
      if (fam === 0 || fam === 1) {
        const expr =
          fam === 0
            ? `\\lim_{x \\to \\infty} \\left(1 + \\frac{${a}}{x}\\right)^{${ax(b)}}`
            : `\\lim_{x \\to 0^+} \\left(1 + ${ax(a)}\\right)^{${b}/x}`
        const log =
          fam === 0
            ? `${ax(b)} \\ln\\left(1 + \\frac{${a}}{x}\\right)`
            : `\\frac{${b} \\ln(1 + ${ax(a)})}{x}`
        return {
          prompt: `Find $${expr}$.`,
          answer: { kind: 'number', value: Math.exp(a * b), tolerance: Math.exp(a * b) * 1e-6 },
          hints: [
            'The form is $1^\\infty$. Find the limit of the logarithm first.',
            `The logarithm is $${log}$.`,
          ],
          solution: [
            `$\\ln y = ${log}$, a ${fam === 0 ? '$\\infty \\cdot 0$' : '$\\frac{0}{0}$'} form, which tends to $${a * b}$ by the rule.`,
            `So the limit is $e^{${a * b}}$.`,
          ],
          data: rec({ fam, a, b }),
        }
      }
      if (fam === 2) {
        return {
          prompt: `Find $\\lim_{x \\to \\infty} \\left(e^x + x\\right)^{${a}/x}$.`,
          answer: { kind: 'number', value: Math.exp(a), tolerance: Math.exp(a) * 1e-6 },
          hints: [
            'The form is $\\infty^0$. Take the logarithm.',
            `$\\ln y = \\frac{${a} \\ln(e^x + x)}{x}$, an $\\frac{\\infty}{\\infty}$ form.`,
          ],
          solution: [
            `The rule gives $\\frac{${a}(e^x + 1)}{e^x + x} = \\frac{${a}(1 + e^{-x})}{1 + xe^{-x}} \\to ${a}$.`,
            `So the limit is $e^{${a}}$.`,
          ],
          data: rec({ fam, a, b }),
        }
      }
      return {
        prompt: `Find $\\lim_{x \\to 0^+} x^{\\sin ${ax(a)}}$.`,
        answer: { kind: 'number', value: 1 },
        hints: [
          'The form is $0^0$. Take the logarithm.',
          `$\\ln y = \\sin(${ax(a)}) \\ln x = \\frac{\\sin ${ax(a)}}{${ax(a)}} \\cdot ${a === 1 ? '' : a}x \\ln x$.`,
        ],
        solution: [
          `$\\frac{\\sin ${ax(a)}}{${ax(a)}} \\to 1$ and $x \\ln x \\to 0$, so $\\ln y \\to 0$.`,
          'So the limit is $e^0 = 1$.',
        ],
        data: rec({ fam, a, b }),
      }
    },
  },
  {
    id: 'compounding',
    title: 'Continuous compounding',
    skills: ['lhopital'],
    difficulty: 1,
    generate: (rng) => {
      const P = rng.pick([1000, 2500, 5000])
      const pct = rng.pick([3, 4, 5, 6, 8])
      const t = rng.pick([5, 10, 20])
      const r = pct / 100
      const continuous = P * Math.exp(r * t)
      const monthly = P * (1 + r / 12) ** (12 * t)
      const compare = rng.bool()
      const value = compare ? continuous - monthly : continuous
      return {
        prompt: compare
          ? `${P} dollars are invested at $${pct}\\%$ a year for ${t} years. How much more does continuous compounding pay than monthly compounding? Answer in dollars, to the nearest cent.`
          : `${P} dollars are invested at $${pct}\\%$ a year, compounded continuously. What is the balance after ${t} years, in dollars, to the nearest cent?`,
        answer: { kind: 'number', value, tolerance: 0.006 },
        hints: [
          `Paid $n$ times a year, the balance is $${P}\\left(1 + \\frac{${r}}{n}\\right)^{${t}n}$. Its limit as $n \\to \\infty$ is a $1^\\infty$ form.`,
          `The logarithm tends to $${t} \\cdot ${r}$, so the limit is $${P}e^{${dec(r * t)}}$.`,
        ],
        solution: [
          `Continuously: $${P}e^{${r} \\cdot ${t}} \\approx ${continuous.toFixed(2)}$.`,
          ...(compare
            ? [
                `Monthly: $${P}\\left(1 + \\frac{${r}}{12}\\right)^{${12 * t}} \\approx ${monthly.toFixed(2)}$. The difference is about $${value.toFixed(2)}$ dollars.`,
              ]
            : []),
        ],
        data: rec({ P, r, t, compare: compare ? 1 : 0 }),
      }
    },
  },
  {
    id: 'check-the-form',
    title: 'Does the rule apply?',
    skills: ['lhopital'],
    difficulty: 2,
    generate: (rng) => {
      const fam = rng.int(0, 1)
      if (fam === 0) {
        const a = rng.int(1, 4)
        const b = rng.int(1, 4)
        const c = rng.int(1, 5)
        return {
          prompt: `Find $\\lim_{x \\to 0} \\frac{\\cos ${ax(a)} + ${b}}{x + ${c}}$.`,
          answer: { kind: 'number', value: (1 + b) / c },
          hints: ['Substitute before anything else.'],
          solution: [
            `At $x = 0$ the quotient is $\\frac{1 + ${b}}{${c}}$: not an indeterminate form, so the limit is $${frac(1 + b, c)}$.`,
            `Applying the rule here would give $\\frac{-${a === 1 ? '' : a}\\sin 0}{1} = 0$, which is wrong.`,
          ],
          data: rec({ fam, a, b, c }),
        }
      }
      const a = rng.int(1, 6)
      const b = rng.int(2, 5)
      return {
        prompt: `Find $\\lim_{x \\to \\infty} \\frac{${ax(a)} + \\sin x}{${ax(b)} + \\cos x}$.`,
        answer: { kind: 'number', value: a / b },
        hints: [
          `The ratio of the derivatives, $\\frac{${a} + \\cos x}{${b} - \\sin x}$, has no limit, so the rule says nothing.`,
          'Divide the top and the bottom by $x$.',
        ],
        solution: [
          `$\\frac{${a} + \\frac{\\sin x}{x}}{${b} + \\frac{\\cos x}{x}}$, and $\\frac{\\sin x}{x}, \\frac{\\cos x}{x} \\to 0$ (squeeze them between $\\pm\\frac{1}{x}$).`,
          `So the limit is $${frac(a, b)}$, although $\\frac{f'}{g'}$ keeps oscillating.`,
        ],
        data: rec({ fam, a, b }),
      }
    },
  },
  {
    id: 'newton-step',
    title: 'One Newton step',
    skills: ['newtons-method'],
    difficulty: 1,
    generate: (rng) => {
      for (;;) {
        const c2 = rng.int(-3, 3)
        const c1 = rng.int(-5, 5)
        const c0 = rng.int(-6, 6)
        const x0 = rng.pick([-2, -1, 1, 2, 3])
        const f = x0 ** 3 + c2 * x0 ** 2 + c1 * x0 + c0
        const df = 3 * x0 ** 2 + 2 * c2 * x0 + c1
        if (df === 0 || f === 0) continue
        const x1 = x0 - f / df
        return {
          prompt: `Apply one step of Newton's method to $f(x) = ${poly([1, c2, c1, c0])}$ from $x_0 = ${x0}$. What is $x_1$?`,
          answer: { kind: 'number', value: x1 },
          hints: [`$f'(x) = ${poly([3, 2 * c2, c1])}$.`, "$x_1 = x_0 - \\frac{f(x_0)}{f'(x_0)}$."],
          solution: [
            `$f(${x0}) = ${f}$ and $f'(${x0}) = ${df}$.`,
            `$x_1 = ${x0} - \\frac{${f}}{${df}} = ${frac(x0 * df - f, df)}$.`,
          ],
          data: rec({ c2, c1, c0, x0 }),
        }
      }
    },
  },
  {
    id: 'newton-sqrt',
    title: 'A square root by hand',
    skills: ['newtons-method'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.pick([3, 5, 6, 7, 10, 11, 13, 17, 20])
      const x0 = Math.round(Math.sqrt(a))
      const x1 = (x0 + a / x0) / 2
      const x2 = (x1 + a / x1) / 2
      return {
        prompt: `Use Newton's method on $f(x) = x^2 - ${a}$ from $x_0 = ${x0}$ to approximate $\\sqrt{${a}}$. What is $x_2$? Give it to six decimal places.`,
        answer: { kind: 'number', value: x2, tolerance: 6e-7 },
        hints: [
          'For $x^2 - a$ the step is $x_{n+1} = \\frac{1}{2}\\left(x_n + \\frac{a}{x_n}\\right)$.',
          `$x_1 = \\frac{1}{2}\\left(${x0} + \\frac{${a}}{${x0}}\\right) = ${num(x1, 64)}$.`,
        ],
        solution: [
          `$x_1 = \\frac{1}{2}\\left(${x0} + \\frac{${a}}{${x0}}\\right) = ${num(x1, 64)}$.`,
          `$x_2 = \\frac{1}{2}\\left(x_1 + \\frac{${a}}{x_1}\\right) \\approx ${x2.toFixed(6)}$, while $\\sqrt{${a}} \\approx ${Math.sqrt(a).toFixed(6)}$.`,
        ],
        data: rec({ a, x0 }),
      }
    },
  },
  {
    id: 'newton-root',
    title: 'A root to four decimals',
    skills: ['newtons-method'],
    difficulty: 2,
    generate: (rng) => {
      const fam = rng.int(0, 2)
      // Cubics x^3 + p x - q are increasing (p > 0), so they have exactly one real root.
      const p = rng.int(1, 4)
      const q = rng.int(3, 12)
      const setup =
        fam === 0
          ? {
              eq: `x^3 + ${ax(p)} = ${q}`,
              f: (x: number) => x ** 3 + p * x - q,
              df: (x: number) => 3 * x * x + p,
              ftex: `f(x) = x^3 + ${ax(p)} - ${q}`,
              dftex: `f'(x) = 3x^2 + ${p}`,
              x0: Math.round(Math.cbrt(q)),
            }
          : fam === 1
            ? {
                eq: '\\cos x = x',
                f: (x: number) => Math.cos(x) - x,
                df: (x: number) => -Math.sin(x) - 1,
                ftex: 'f(x) = \\cos x - x',
                dftex: "f'(x) = -\\sin x - 1",
                x0: 1,
              }
            : {
                eq: 'e^{-x} = x',
                f: (x: number) => Math.exp(-x) - x,
                df: (x: number) => -Math.exp(-x) - 1,
                ftex: 'f(x) = e^{-x} - x',
                dftex: "f'(x) = -e^{-x} - 1",
                x0: 1,
              }
      const xs = iterate(setup.f, setup.df, setup.x0, 8)
      const root = xs[8]!
      return {
        prompt: `Solve $${setup.eq}$ with Newton's method from $x_0 = ${setup.x0}$${fam === 1 ? ' (in radians)' : ''}. Give the solution to four decimal places.`,
        answer: { kind: 'number', value: root, tolerance: 6e-5 },
        hints: [
          `Write it as $${setup.ftex} = 0$; then $${setup.dftex}$.`,
          'Iterate until two consecutive values agree to five or six decimals.',
        ],
        solution: [
          `$x_1 \\approx ${dec(xs[1]!)}$, $x_2 \\approx ${dec(xs[2]!)}$, $x_3 \\approx ${dec(xs[3]!)}$, $x_4 \\approx ${dec(xs[4]!)}$.`,
          `The iterates settle at $x \\approx ${root.toFixed(4)}$.`,
        ],
        data: rec({ fam, p, q, x0: setup.x0 }),
      }
    },
  },
  {
    id: 'newton-behavior',
    title: 'When Newton fails',
    skills: ['newtons-method'],
    difficulty: 2,
    generate: (rng) => {
      const kind = rng.int(0, 3)
      const options = [...BEHAVIORS]
      if (kind === 0) {
        const a = rng.int(2, 9)
        const x0 = a
        return {
          prompt: `Newton's method is applied to $f(x) = x^2 - ${a}$ from $x_0 = ${x0}$. What happens?`,
          answer: { kind: 'choice', options, correct: 0 },
          hints: ['Compute $x_1$ and $x_2$. Are they closer to a root?'],
          solution: [
            `$x_1 = \\frac{1}{2}\\left(${x0} + \\frac{${a}}{${x0}}\\right) = ${num((x0 + a / x0) / 2)}$, and the following iterates decrease toward $\\sqrt{${a}}$.`,
            'For $x^2 - a$ every positive start converges to $\\sqrt{a}$.',
          ],
          data: rec({ kind, a, x0 }),
        }
      }
      if (kind === 1) {
        const c = rng.pick([1, 2, 3])
        return {
          prompt: `Newton's method is applied to $f(x) = ${poly([1, 0, -2 * c * c, 2 * c ** 3])}$ from $x_0 = 0$. What happens?`,
          answer: { kind: 'choice', options, correct: 1 },
          hints: ['Compute $x_1$ and $x_2$.'],
          solution: [
            `$f(0) = ${2 * c ** 3}$ and $f'(0) = ${-2 * c * c}$, so $x_1 = ${c}$.`,
            `$f(${c}) = ${c ** 3}$ and $f'(${c}) = ${c * c}$, so $x_2 = ${c} - ${c} = 0 = x_0$: the iterates repeat $0, ${c}, 0, ${c}, \\dots$ and never reach the root.`,
          ],
          data: rec({ kind, c }),
        }
      }
      if (kind === 2) {
        const h = rng.int(-2, 2)
        const d = rng.pick([1, -1, 2])
        const x0 = h + d
        return {
          prompt: `Newton's method is applied to $f(x) = \\sqrt[3]{${h === 0 ? 'x' : poly([1, -h])}}$ from $x_0 = ${x0}$. What happens?`,
          answer: { kind: 'choice', options, correct: 2 },
          hints: [
            `With $u = ${h === 0 ? 'x' : poly([1, -h])}$, $f'(x) = \\frac{1}{3}u^{-2/3}$, so $\\frac{f}{f'} = 3u$.`,
          ],
          solution: [
            `The step is $x_{n+1} = x_n - 3(x_n ${h === 0 ? '' : h > 0 ? `- ${h}` : `+ ${-h}`})$, so the distance to the root $${h}$ is multiplied by $-2$ each time.`,
            `$x_1 = ${h - 2 * d}$, $x_2 = ${h + 4 * d}$: the iterates move away. The theorem does not apply, since $f'(${h})$ does not exist.`,
          ],
          data: rec({ kind, h, x0 }),
        }
      }
      const a = rng.int(2, 9)
      return {
        prompt: `Newton's method is applied to $f(x) = x^2 - ${a}$ from $x_0 = 0$. What happens?`,
        answer: { kind: 'choice', options, correct: 3 },
        hints: ["Compute $f'(0)$."],
        solution: [
          "$f'(0) = 0$: the tangent at $(0, " +
            `${-a}` +
            ')$ is horizontal and never meets the axis.',
          'There is no $x_1$. Any other start would work.',
        ],
        data: rec({ kind, a, x0: 0 }),
      }
    },
  },
  {
    id: 'newton-minimum',
    title: 'Newton for a minimum',
    skills: ['newtons-method', 'optimization'],
    difficulty: 2,
    generate: (rng) => {
      for (;;) {
        const c2 = rng.int(-3, 3)
        const c1 = rng.nonZeroInt(-6, 6)
        const x0 = rng.pick([-2, -1, 1, 2])
        const d1 = 4 * x0 ** 3 + 2 * c2 * x0 + c1
        const d2 = 12 * x0 * x0 + 2 * c2
        if (d2 <= 0 || d1 === 0) continue
        const x1 = x0 - d1 / d2
        return {
          prompt: `To find a minimum of $g(x) = ${poly([1, 0, c2, c1, 0])}$, Newton's method is applied to $g'$ from $x_0 = ${x0}$. What is $x_1$?`,
          answer: { kind: 'number', value: x1 },
          hints: [
            `$g'(x) = ${poly([4, 0, 2 * c2, c1])}$ and $g''(x) = ${poly([12, 0, 2 * c2])}$.`,
            "$x_1 = x_0 - \\frac{g'(x_0)}{g''(x_0)}$.",
          ],
          solution: [
            `$g'(${x0}) = ${d1}$ and $g''(${x0}) = ${d2}$.`,
            `$x_1 = ${x0} - \\frac{${d1}}{${d2}} = ${frac(x0 * d2 - d1, d2)}$. Since $g''(x_0) > 0$, the fitted parabola opens upward, and $x_1$ is its lowest point.`,
          ],
          data: rec({ c2, c1, x0 }),
        }
      }
    },
  },
])
