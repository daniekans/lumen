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
    {
      id: 'standard-limits',
      title: 'Use the squeeze theorem and the standard limits of sin x / x, e and (1 + 1/n)^n',
    },
    { id: 'continuity', title: 'Check continuity, classify discontinuities and apply the IVT' },
    { id: 'growth-rates', title: 'Compare growth rates at infinity and use big-O' },
    {
      id: 'limit-definition',
      title: 'Find delta for epsilon (and N at infinity) and write epsilon-delta proofs',
    },
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
        'A change in a variable: $\\Delta x = x - a$, and the change in output it causes, $\\Delta y = f(x) - f(a)$. The limit of their ratio is written $\\frac{dy}{dx}$.',
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
        'For polynomials, and for rational, root, exponential and trigonometric functions at points inside their domains (defined on both sides), the limit at $a$ is $f(a)$. Plug in first; only a failure calls for algebra.',
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
    {
      id: 'squeeze-theorem',
      title: 'Squeeze theorem',
      summary:
        'If $g(x) \\le f(x) \\le h(x)$ near $a$ and $g$ and $h$ both tend to $L$ at $a$, then $f$ tends to $L$ too. Also called the sandwich theorem.',
      introducedIn: 'squeeze-and-standard-limits',
    },
    {
      id: 'continuity',
      title: 'Continuity',
      tex: '\\lim_{x \\to a} f(x) = f(a)',
      summary:
        '$f$ is continuous at $a$ when $f(a)$ is defined, the limit at $a$ exists, and the two are equal. On an interval: continuous at every point of it.',
      introducedIn: 'continuity',
    },
    {
      id: 'discontinuity',
      title: 'Discontinuity',
      summary:
        'A point where a function is not continuous. Removable: the limit exists but differs from the value or the value is missing. Jump: the one-sided limits differ. Infinite: a vertical asymptote. Oscillating: no limit at all.',
      introducedIn: 'continuity',
    },
    {
      id: 'intermediate-value-theorem',
      title: 'Intermediate value theorem',
      summary:
        'If $f$ is continuous on $[a, b]$ and $N$ is between $f(a)$ and $f(b)$, then $f(c) = N$ for some $c$ in $(a, b)$. With $N = 0$: a sign change means a root.',
      introducedIn: 'continuity',
    },
    {
      id: 'bisection-method',
      title: 'Bisection method',
      summary:
        'Root finding by halving: keep the half of the interval where $f$ changes sign. After $k$ steps the root is trapped in an interval of width $\\frac{b - a}{2^k}$.',
      introducedIn: 'continuity',
    },
    {
      id: 'logarithmic-scale',
      title: 'Logarithmic scale',
      tex: '\\log_{10} y',
      summary:
        'An axis where equal steps multiply by the same factor, usually $10$. Exponentials become straight lines on it.',
      introducedIn: 'growth-rates',
    },
    {
      id: 'big-o',
      title: 'Big-O notation',
      tex: 'f = O(g)',
      summary:
        '$|f(x)| \\le C\\,|g(x)|$ for some constant $C$ and all large enough $x$. It keeps the order of growth and drops constant factors and lower terms.',
      introducedIn: 'growth-rates',
    },
    {
      id: 'epsilon-delta',
      title: 'Epsilon-delta definition',
      tex: '\\forall \\varepsilon > 0\\ \\exists \\delta > 0:\\ 0 < |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon',
      summary:
        '$\\lim_{x \\to a} f(x) = L$ means: for every tolerance $\\varepsilon > 0$ there is a $\\delta > 0$ such that every $x$ with $0 < |x - a| < \\delta$ gives $|f(x) - L| < \\varepsilon$.',
      introducedIn: 'epsilon-delta',
    },
    {
      id: 'epsilon-n',
      title: 'Epsilon-N definition',
      tex: '\\forall \\varepsilon > 0\\ \\exists N:\\ x > N \\Rightarrow |f(x) - L| < \\varepsilon',
      summary:
        '$\\lim_{x \\to \\infty} f(x) = L$ means: for every $\\varepsilon > 0$ there is an $N$ such that every $x > N$ gives $|f(x) - L| < \\varepsilon$. The same idea with a threshold in place of a window.',
      introducedIn: 'epsilon-delta',
    },
  ],
})
