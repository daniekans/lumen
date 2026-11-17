import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'The mean value theorem',
  summary:
    "Somewhere between $a$ and $b$, a smooth curve's tangent is parallel to the secant from $A$ to $B$: the instantaneous rate equals the average rate. It is the bridge from slopes at points to facts about whole intervals: $f' = 0$ means constant and $f' > 0$ means increasing.",
  tags: [
    "Rolle's theorem",
    'mean value theorem',
    'secant',
    'tangent',
    'average rate',
    'increasing',
  ],
  level: 'core',
  order: 3,
  codeCorner: 'bottom-right',
  skills: ['mean-value-theorem'],
  steps: [
    {
      id: 'rolle',
      title: "Rolle's theorem",
      caption:
        "$A$ and $B$ are at the same height, so the chord is flat. Between them the curve goes up and comes back, and at its top the tangent is flat: $f'(c) = 0$. Drag $a$; $B$ follows to keep the heights equal.",
    },
    {
      id: 'mvt',
      title: 'Tilt the chord',
      caption:
        "Now $B$ moves freely and the chord tilts. There is still a point $c$ where the tangent is parallel to it: $f'(c) = \\frac{f(b) - f(a)}{b - a}$. Drag $A$ and $B$; sometimes there are two such points.",
    },
    {
      id: 'proof',
      title: 'Back to Rolle',
      caption:
        "Subtract the chord from the curve: the gap $h(x)$ is $0$ at both ends, so Rolle gives a $c$ with $h'(c) = 0$. There the curve and the chord have the same slope. The gap is largest at $c$.",
    },
    {
      id: 'fails',
      title: 'A corner breaks it',
      caption:
        'For $|x - 2| + 1$ on $[0.5, 4]$, the chord has slope $\\frac{1}{7}$, but every tangent has slope $1$ or $-1$. The theorem needs a derivative at every point inside the interval, and $x = 2$ has none.',
    },
    {
      id: 'speed',
      title: 'An average speed check',
      caption:
        'A car covers 160 km in 1.5 hours, an average of $106.7$ km/h. Whatever happened on the way, at some instant the speedometer read exactly $106.7$ km/h. Section speed cameras rely on this.',
    },
    {
      id: 'same-slope',
      title: 'Same slope, a constant apart',
      caption:
        "If $f' = 0$ on an interval, every chord is flat, so $f$ is constant. Applied to $f - g$: functions with the same derivative differ by a constant, and their graphs are vertical shifts. Move $x$: the tangents stay parallel.",
    },
  ],
})
