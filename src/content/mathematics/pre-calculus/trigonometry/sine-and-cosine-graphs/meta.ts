import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Graphs of sine and cosine',
  summary:
    'Unroll the unit circle onto the x-axis and the height of the moving point traces the sine wave; its horizontal coordinate traces cosine, the same wave shifted. Stretching and shifting give every sinusoid, and the slope of the radius gives tangent.',
  tags: ['sine', 'cosine', 'tangent', 'period', 'amplitude', 'phase shift', 'sinusoid'],
  level: 'intro',
  order: 2,
  skills: ['trig-graphs', 'unit-circle'],
  steps: [
    {
      id: 'unroll',
      title: 'Unrolling the circle',
      caption:
        'As $P$ walks around the circle, lay the walked arc flat on the $x$-axis: it ends at $x = \\theta$. Carry the height of $P$ across to that $x$, and the heights trace $y = \\sin x$.',
    },
    {
      id: 'cosine',
      title: 'Cosine is a shifted sine',
      caption:
        'The horizontal coordinate of $P$ traces $y = \\cos x$. It is the sine wave moved $\\frac{\\pi}{2}$ to the left: $\\cos x = \\sin\\left(x + \\frac{\\pi}{2}\\right)$, since cosine reaches each value a quarter turn earlier.',
    },
    {
      id: 'period',
      title: 'One period',
      caption:
        'Every $2\\pi$ the point is back where it started, so both graphs repeat with period $2\\pi$ and stay between $-1$ and $1$. Sine is $0$ at multiples of $\\pi$, cosine at odd multiples of $\\frac{\\pi}{2}$.',
    },
    {
      id: 'amplitude',
      title: 'Amplitude and period',
      caption:
        '$y = A \\sin(Bx)$ stretches the wave: its amplitude is $\\lvert A \\rvert$, and $B$ cycles fit where one did, so the period is $\\frac{2\\pi}{\\lvert B \\rvert}$. A negative $A$ flips it. Drag $A$ and $B$.',
    },
    {
      id: 'shift',
      title: 'Shift and midline',
      caption:
        '$y = A \\sin(B(x - C)) + D$ moves the wave right by $C$ and up by $D$: it oscillates around the midline $y = D$, between $D - \\lvert A \\rvert$ and $D + \\lvert A \\rvert$. Drag $C$ and $D$.',
    },
    {
      id: 'tangent',
      title: 'Tangent as a slope',
      caption:
        '$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ is the slope of the radius to $P$, read as the height where that line meets $x = 1$. It is undefined where $\\cos\\theta = 0$, and it repeats every $\\pi$. Drag $\\theta$.',
    },
  ],
})
