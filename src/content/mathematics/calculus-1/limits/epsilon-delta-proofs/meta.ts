import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Epsilon-delta proofs',
  summary:
    'How to prove a limit from the definition: work backward from |f(x) - L| < ε to a δ, then write the proof forward. Linear functions give δ = ε / |m|; a quadratic needs a bound on the extra factor, hence δ = min(1, ε / 3); the sum law splits ε in two; and a jump is beaten by one ε.',
  tags: ['epsilon-delta', 'proof', 'limit laws', 'limit'],
  level: 'core',
  order: 10,
  skills: ['limit-definition'],
  steps: [
    {
      id: 'definition',
      title: 'What a proof must show',
      caption:
        'To prove $\\lim_{x \\to 1} (2x + 1) = 3$, give a rule that turns any $\\varepsilon$ into a $\\delta$ that works. For a line the band and the window meet at the corners: the window that fits is $\\delta = \\frac{\\varepsilon}{2}$, since the slope is $2$. Move $\\varepsilon$.',
      check: {
        kind: 'number',
        prompt:
          'For $f(x) = 3x + 1$ near $a = 2$ (so $L = 7$) and $\\varepsilon = 0.6$, what is the largest $\\delta$ that works?',
        answer: 0.2,
        explanation: '$|3x + 1 - 7| = 3|x - 2| < 0.6$ exactly when $|x - 2| < 0.2$.',
      },
    },
    {
      id: 'linear',
      title: 'Scratch work, then the proof',
      caption:
        'Work backward: $|f(x) - 3| = |2x - 2| = 2|x - 1|$, which is less than $\\varepsilon$ when $|x - 1| < \\frac{\\varepsilon}{2}$. Then write it forward: given $\\varepsilon > 0$, let $\\delta = \\frac{\\varepsilon}{2}$; if $0 < |x - 1| < \\delta$, then $|f(x) - 3| = 2|x - 1| < 2\\delta = \\varepsilon$.',
      check: {
        kind: 'number',
        prompt:
          'A proof that $\\lim_{x \\to 1} (5 - 4x) = 1$ chooses $\\delta = c\\,\\varepsilon$. What is the largest $c$ that works for every $\\varepsilon$?',
        answer: 0.25,
        explanation:
          '$|5 - 4x - 1| = |4 - 4x| = 4|x - 1|$, which is less than $\\varepsilon$ when $|x - 1| < \\frac{\\varepsilon}{4}$. So $c = \\frac{1}{4}$.',
      },
    },
    {
      id: 'quadratic',
      title: 'A quadratic: bound the other factor',
      caption:
        'For $\\lim_{x \\to 1} x^2 = 1$, factor: $|x^2 - 1| = |x - 1|\\,|x + 1|$. The factor $|x + 1|$ is not constant, so first keep $\\delta \\le 1$: then $0 < x < 2$ and $|x + 1| < 3$. Now $|x^2 - 1| < 3|x - 1| < \\varepsilon$ when $|x - 1| < \\frac{\\varepsilon}{3}$. Take $\\delta = \\min\\left(1, \\frac{\\varepsilon}{3}\\right)$.',
      check: {
        kind: 'number',
        prompt:
          'With the rule $\\delta = \\min\\left(1, \\frac{\\varepsilon}{3}\\right)$ for $\\lim_{x \\to 1} x^2 = 1$, what $\\delta$ does $\\varepsilon = 0.6$ get?',
        answer: 0.2,
        explanation: '$\\frac{0.6}{3} = 0.2$, which is less than $1$, so $\\delta = 0.2$.',
      },
    },
    {
      id: 'restriction',
      title: 'Why the minimum',
      caption:
        'The bound $|x + 1| < 3$ holds only inside $|x - 1| < 1$. For a large $\\varepsilon$ such as $6$, $\\frac{\\varepsilon}{3} = 2$ alone gives a window where $x^2$ reaches $9$ and escapes the band. The minimum keeps the window inside the region where the bound is true. Switch between the two rules.',
      check: {
        kind: 'number',
        prompt:
          'With the rule $\\delta = \\min\\left(1, \\frac{\\varepsilon}{3}\\right)$, what $\\delta$ does $\\varepsilon = 12$ get?',
        answer: 1,
        explanation:
          '$\\frac{12}{3} = 4$, which is more than $1$, so $\\delta = 1$. A small window is always allowed; it only has to work.',
      },
    },
    {
      id: 'sum-law',
      title: 'Proving a limit law',
      caption:
        'If $f \\to L$ and $g \\to M$, then $f + g \\to L + M$. Give each function half the tolerance: $\\delta_f$ for $\\frac{\\varepsilon}{2}$ and $\\delta_g$ for $\\frac{\\varepsilon}{2}$. Inside both windows, $|f + g - (L + M)| \\le |f - L| + |g - M| < \\varepsilon$. So $\\delta = \\min(\\delta_f, \\delta_g)$.',
      check: {
        kind: 'number',
        prompt:
          'For some $\\varepsilon$, $\\delta_f = 0.3$ keeps $f$ within $\\frac{\\varepsilon}{2}$ of $L$ and $\\delta_g = 0.2$ keeps $g$ within $\\frac{\\varepsilon}{2}$ of $M$. What $\\delta$ does the proof take for $f + g$?',
        answer: 0.2,
        explanation: 'The window must sit inside both, so $\\delta = \\min(0.3, 0.2) = 0.2$.',
      },
    },
    {
      id: 'no-limit',
      title: 'Proving there is no limit',
      caption:
        'For $f(x) = -1$ when $x < 0$ and $1$ when $x \\ge 0$, take $\\varepsilon = 1$. Every window holds some $x_1 < 0$ and some $x_2 > 0$, and $2 = |f(x_2) - f(x_1)| \\le |f(x_2) - L| + |L - f(x_1)|$. Both terms cannot be less than $1$, for any $L$. Drag $L$ and shrink $\\delta$.',
      check: {
        kind: 'choice',
        prompt:
          '$f(x) = 0$ for $x < 0$ and $f(x) = 2$ for $x \\ge 0$. Which $\\varepsilon$ proves that $\\lim_{x \\to 0} f(x)$ does not exist?',
        options: [
          '$\\varepsilon = 1$',
          '$\\varepsilon = 1.5$',
          '$\\varepsilon = 2$',
          '$\\varepsilon = 3$',
        ],
        answer: 0,
        explanation:
          'The gap is $2$. With $\\varepsilon = 1$ no $L$ is within $1$ of both $0$ and $2$. With $\\varepsilon = 1.5$, $L = 1$ is within $1.5$ of both, so that $\\varepsilon$ proves nothing.',
      },
    },
  ],
})
