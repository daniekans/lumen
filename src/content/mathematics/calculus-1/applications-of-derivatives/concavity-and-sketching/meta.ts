import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Concavity and curve sketching',
  summary:
    "The second derivative says how the slope changes: where $f'' > 0$ the graph bends upward and lies above its tangents, where $f'' < 0$ it bends downward. Inflection points, the second derivative test and a full sketch follow, with an outbreak curve whose inflection is the peak of new cases.",
  tags: [
    'concavity',
    'second derivative',
    'inflection point',
    'second derivative test',
    'curve sketching',
    'logistic',
  ],
  level: 'core',
  order: 4,
  codeCorner: 'bottom-right',
  skills: ['concavity'],
  steps: [
    {
      id: 'bend',
      title: 'Slopes that increase',
      caption:
        "Slide $P$. Left of $x = 2$ the tangent turns clockwise as you move right: $f'$ decreases, and the curve bends down, below its tangents. Right of $2$ the slope increases and the curve bends up, above them.",
    },
    {
      id: 'inflection',
      title: 'Inflection points',
      caption:
        "Where the bending changes direction, at $x = 2$, $f''$ changes sign: an inflection point. For $\\frac{1}{4}(x - 2)^4 + 0.5$, $f''(2) = 0$ too, but the graph bends up on both sides, so there is no inflection.",
    },
    {
      id: 'second-test',
      title: 'The second derivative test',
      caption:
        "At a flat tangent, the bending decides: $f''(1) = -1.5 < 0$, so the curve bends down and $x = 1$ is a local maximum; $f''(3) = 1.5 > 0$ makes $x = 3$ a local minimum. If $f''(c) = 0$, the test says nothing.",
    },
    {
      id: 'together',
      title: "$f$, $f'$ and $f''$ together",
      caption:
        "Each graph is the slope graph of the one before it: $f'$ of $f$, $f''$ of $f'$. Zeros of $f'$ are the turning points of $f$; zeros of $f''$ are the turning points of $f'$, and the inflection points of $f$. Move $x$ and read the three signs.",
    },
    {
      id: 'sketch',
      title: 'A sketch from the derivatives',
      caption:
        "$f(x) = \\frac{4x}{x^2 + 1}$: odd, through $0$, flat toward $y = 0$ far out. $f' = 0$ at $x = \\pm 1$ gives the minimum $-2$ and maximum $2$; $f'' = 0$ at $0$ and $\\pm\\sqrt{3}$ gives three inflection points. Then the curve.",
    },
    {
      id: 'outbreak',
      title: 'The peak of new cases',
      caption:
        'Cumulative cases in an outbreak often follow a logistic curve. It rises at first faster and faster, then slower and slower. The inflection point, at half the final total, is the day with the most new cases.',
    },
  ],
})
