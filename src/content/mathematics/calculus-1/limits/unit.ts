import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Limits',
  description:
    'What a function approaches near a point and far away, one-sided and infinite limits, the algebra that evaluates limits, continuity, growth rates and the epsilon-delta definition.',
  order: 1,
  skills: [
    { id: 'reading-limits', title: 'Read a limit from a graph or a table of values' },
    { id: 'one-sided-limits', title: 'Find one-sided and infinite limits' },
    { id: 'limits-at-infinity', title: 'Find limits at infinity from the dominant terms' },
    { id: 'evaluating-limits', title: 'Evaluate limits with the limit laws and algebra' },
  ],
  terms: [
    {
      id: 'limit',
      title: 'Limit',
      tex: '\\lim_{x \\to a} f(x) = L',
      summary:
        'The value $L$ that $f(x)$ gets as close to as you like for every $x$ close enough to $a$, from both sides, with $x \\neq a$. The value $f(a)$ itself plays no part.',
      introducedIn: 'approaching-a-value',
    },
    {
      id: 'increment',
      title: 'Increment',
      tex: '\\Delta x,\\ \\Delta y',
      summary:
        'A change in a variable: $\\Delta x = x - a$, and the change in output it causes, $\\Delta y = f(x) - f(a)$ (or $f(x) - L$ near a hole). Leibniz notation $dx$ and $dy$ grows out of these.',
      introducedIn: 'approaching-a-value',
    },
    {
      id: 'one-sided-limit',
      title: 'One-sided limit',
      tex: '\\lim_{x \\to a^-} f(x),\\ \\lim_{x \\to a^+} f(x)',
      summary:
        'The limit with $x$ approaching $a$ from below ($a^-$) or from above ($a^+$) only. The two-sided limit exists exactly when both one-sided limits exist and are equal.',
      introducedIn: 'one-sided-and-infinite',
    },
    {
      id: 'infinite-limit',
      title: 'Infinite limit',
      tex: '\\lim_{x \\to a} f(x) = \\infty',
      summary:
        'Shorthand for values that grow without bound as $x$ approaches $a$. The limit does not exist as a number; the notation says how it fails. The line $x = a$ is a vertical asymptote.',
      introducedIn: 'one-sided-and-infinite',
    },
    {
      id: 'limit-at-infinity',
      title: 'Limit at infinity',
      tex: '\\lim_{x \\to \\infty} f(x) = L',
      summary:
        'The value $f(x)$ settles toward as $x$ grows without bound (or as $x \\to -\\infty$). The line $y = L$ is a horizontal asymptote.',
      introducedIn: 'one-sided-and-infinite',
    },
    {
      id: 'limit-laws',
      title: 'Limit laws',
      summary:
        'When $\\lim f = L$ and $\\lim g = M$ exist, the limit of a sum, difference, product or constant multiple is the sum, difference, product or multiple of the limits, and of a quotient it is $\\frac{L}{M}$ if $M \\neq 0$.',
      introducedIn: 'limit-laws',
    },
    {
      id: 'direct-substitution',
      title: 'Direct substitution',
      summary:
        'For polynomials, and for rational, root, exponential and trigonometric functions where they are defined, the limit at $a$ is $f(a)$. Plug in first; only a failure calls for algebra.',
      introducedIn: 'limit-laws',
    },
    {
      id: 'indeterminate-form',
      title: 'Indeterminate form',
      tex: '\\frac{0}{0}',
      summary:
        'A substitution result such as $\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$ that does not decide the limit: it can be any number, infinite, or not exist. Algebra (factor, rationalize, combine fractions) removes it.',
      introducedIn: 'limit-laws',
    },
  ],
})
