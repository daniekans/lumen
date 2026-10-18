import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'The epsilon-delta definition',
  summary:
    'The limit made precise as a game: someone names a tolerance ε around L, and you answer with a window δ around a whose outputs all land inside it. The limit is L when you can always answer. A jump has no answer for small ε, and at infinity the window becomes a threshold N.',
  tags: ['limit', 'epsilon-delta', 'epsilon-N', 'definition', 'proof'],
  level: 'core',
  order: 9,
  skills: ['limit-definition'],
  steps: [
    {
      id: 'band',
      title: 'How close is close?',
      caption:
        '$\\lim_{x \\to 2} f(x) = 2$ says $f(x)$ gets close to $2$. To make "close" precise, pick a tolerance $\\varepsilon$: the band $2 - \\varepsilon < y < 2 + \\varepsilon$. The yellow stretch of the $x$-axis holds the inputs whose outputs land in the band. Move $\\varepsilon$.',
    },
    {
      id: 'window',
      title: 'A window around a',
      caption:
        'Now pick a window $0 < |x - 2| < \\delta$. It works when the whole piece of graph above it stays inside the band. Too wide and the graph escapes; narrow enough and it fits. The point at $x = 2$ itself is left out, so $f(2) = 3$ does not matter.',
    },
    {
      id: 'game',
      title: 'The game',
      caption:
        'A challenger names $\\varepsilon$, you answer with $\\delta$. Here $\\varepsilon$ shrinks round after round, and each time a $\\delta$ that works is found. The limit is $2$ exactly because you never run out of answers: for every $\\varepsilon > 0$ there is a $\\delta > 0$.',
    },
    {
      id: 'sides',
      title: 'The nearer side decides',
      caption:
        'The graph curves, so the inputs that land in the band reach farther on the left than on the right. The window is symmetric, so it can only be as wide as the nearer edge: $\\delta = \\min(\\delta_\\text{left}, \\delta_\\text{right})$. Any smaller $\\delta$ works too.',
    },
    {
      id: 'jump',
      title: 'When no $\\delta$ works',
      caption:
        'At a jump the graph approaches $1$ from the left and $2.5$ from the right. Drag the claimed limit $L$. Once $\\varepsilon$ is at most half the gap, $0.75$, every window, however small, holds points from both sides, and they cannot both be within $\\varepsilon$ of $L$. No $L$ wins the game, so there is no limit.',
    },
    {
      id: 'infinity',
      title: 'Epsilon-N at infinity',
      caption:
        'For $x \\to \\infty$ the window becomes a threshold: $\\lim_{x \\to \\infty} f(x) = L$ when for every $\\varepsilon$ there is an $N$ with $|f(x) - L| < \\varepsilon$ for all $x > N$. Here $f(x) = 2 + \\frac{6 \\sin x}{x}$ wiggles, so $N$ must be past its last escape. Move $\\varepsilon$.',
    },
  ],
})
