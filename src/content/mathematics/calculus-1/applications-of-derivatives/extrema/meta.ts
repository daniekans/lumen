import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Extrema',
  summary:
    "Peaks and valleys of a graph happen where the tangent is flat or missing: at critical points. The sign of $f'$ around a critical point tells a maximum from a minimum, and on a closed interval the largest and smallest values are among the critical points and the two ends.",
  tags: [
    'local maximum',
    'local minimum',
    'critical point',
    "Fermat's theorem",
    'first derivative test',
    'extreme value theorem',
    'closed interval method',
  ],
  level: 'core',
  order: 2,
  codeCorner: 'bottom-right',
  skills: ['extrema'],
  steps: [
    {
      id: 'local',
      title: 'Peaks and valleys',
      caption:
        '$f(1) = 2$ is a local maximum: no point nearby is higher, though points far to the right are. $f(3) = 1$ is a local minimum. Drag $P$: at both, the tangent is flat.',
    },
    {
      id: 'fermat',
      title: 'Why the tangent is flat',
      caption:
        "At the peak $x = 1$, secants to the right slope down or are flat, and secants to the left slope up or are flat. As $h \\to 0$ both tend to $f'(1)$, which must be $\\le 0$ and $\\ge 0$ at once: $f'(1) = 0$.",
    },
    {
      id: 'critical',
      title: 'Critical points',
      caption:
        "A critical point is where $f' = 0$ or $f'$ does not exist. Every local extremum inside the domain is one, but the converse fails: $x = 2$ is critical for both other functions, and only one of them has an extremum there.",
    },
    {
      id: 'first-test',
      title: 'The first derivative test',
      caption:
        "The sign of $f' = \\frac{3}{4}(x - 1)(x - 3)$: positive, then negative, then positive. Rising into $x = 1$ and falling after it makes a maximum; falling into $x = 3$ and rising after it makes a minimum.",
    },
    {
      id: 'closed',
      title: 'Absolute extrema on a closed interval',
      caption:
        'On $[a, b]$ the largest and smallest values are among the critical points inside and the two ends. Compare their heights. Drag the ends: sometimes an end wins.',
    },
    {
      id: 'dose',
      title: "A drug's peak",
      caption:
        "After a dose, the concentration in the blood is $C(t) = 8t\\,e^{-t/2}$ mg/L, $t$ in hours. $C'(t) = 4e^{-t/2}(2 - t)$ is zero at $t = 2$: the peak, $\\frac{16}{e} \\approx 5.89$ mg/L. Over $[0, 12]$, the lowest value is at the end $t = 0$.",
    },
    {
      id: 'no-max',
      title: 'When there is no maximum',
      caption:
        'The guarantee needs a continuous function on a closed interval. On an open interval the top can be approached but never reached; with a jump, the same. Neither function has a largest value.',
    },
  ],
})
