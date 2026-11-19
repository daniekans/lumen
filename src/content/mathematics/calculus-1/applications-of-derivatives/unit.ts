import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Applications of derivatives',
  description:
    "Linear approximation, extrema, the mean value theorem, concavity and curve sketching, optimization, L'Hôpital's rule and Newton's method.",
  order: 3,
  skills: [
    {
      id: 'linear-approximation',
      title: 'Estimate values and errors with the tangent line and differentials',
    },
    {
      id: 'extrema',
      title: 'Find critical points, classify them, and find absolute extrema on a closed interval',
    },
    {
      id: 'mean-value-theorem',
      title: "Apply Rolle's theorem and the mean value theorem, and use their consequences",
    },
    {
      id: 'concavity',
      title: "Find concavity and inflection points, and read f, f' and f'' together",
    },
    {
      id: 'optimization',
      title: 'Model a quantity as a function of one variable on an interval, and optimize it',
    },
  ],
  terms: [
    {
      id: 'differential',
      title: 'Differential',
      tex: "dy = f'(x)\\,dx",
      summary:
        "For $y = f(x)$, $dx$ is any change in $x$ and $dy = f'(x)\\,dx$ is the change along the tangent line. When $dx \\neq 0$, $\\frac{dy}{dx}$ is their quotient, and it equals $f'(x)$.",
      introducedIn: 'linear-approximation',
    },
    {
      id: 'linearization',
      title: 'Linearization',
      tex: "L(x) = f(a) + f'(a)(x - a)",
      summary:
        'The tangent line at $a$ used as an approximation of $f$ near $a$. Its error is small compared with $x - a$, and no other line has that property.',
      introducedIn: 'linear-approximation',
    },
    {
      id: 'local-extremum',
      title: 'Local maximum and minimum',
      summary:
        '$f(c)$ is a local maximum when $f(c) \\ge f(x)$ for every $x$ in some open interval around $c$, and a local minimum when $f(c) \\le f(x)$ there.',
      introducedIn: 'extrema',
    },
    {
      id: 'critical-point',
      title: 'Critical point',
      summary:
        "A point $c$ in the domain of $f$ where $f'(c) = 0$ or $f'(c)$ does not exist. Every local extremum inside the domain is at a critical point, but not every critical point is an extremum.",
      introducedIn: 'extrema',
    },
    {
      id: 'fermats-theorem',
      title: "Fermat's theorem",
      summary: "If $f$ has a local extremum at $c$ and $f'(c)$ exists, then $f'(c) = 0$.",
      introducedIn: 'extrema',
    },
    {
      id: 'first-derivative-test',
      title: 'First derivative test',
      summary:
        "At a critical point $c$ of a continuous $f$: if $f'$ changes from positive to negative at $c$, $f(c)$ is a local maximum; from negative to positive, a local minimum; no change of sign, neither.",
      introducedIn: 'extrema',
    },
    {
      id: 'extreme-value-theorem',
      title: 'Extreme value theorem',
      summary:
        'A function continuous on a closed, bounded interval $[a, b]$ attains an absolute maximum and an absolute minimum there.',
      introducedIn: 'extrema',
    },
    {
      id: 'rolles-theorem',
      title: "Rolle's theorem",
      summary:
        "If $f$ is continuous on $[a, b]$, differentiable on $(a, b)$ and $f(a) = f(b)$, then $f'(c) = 0$ for some $c$ in $(a, b)$.",
      introducedIn: 'mean-value-theorem',
    },
    {
      id: 'mean-value-theorem',
      title: 'Mean value theorem',
      summary:
        "If $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$, then $f'(c) = \\frac{f(b) - f(a)}{b - a}$ for some $c$ in $(a, b)$: some tangent is parallel to the secant.",
      introducedIn: 'mean-value-theorem',
    },
    {
      id: 'concavity',
      title: 'Concave up and concave down',
      summary:
        "$f$ is concave up on an interval where $f'$ is increasing (the graph bends upward, above its tangents) and concave down where $f'$ is decreasing. If $f'' > 0$ on the interval, $f$ is concave up there.",
      introducedIn: 'concavity-and-sketching',
    },
    {
      id: 'inflection-point',
      title: 'Inflection point',
      summary:
        "A point of the graph where $f$ is continuous and its concavity changes. There $f''$ is $0$ or does not exist, but $f''(c) = 0$ alone is not enough ($x^4$ at $0$).",
      introducedIn: 'concavity-and-sketching',
    },
    {
      id: 'second-derivative-test',
      title: 'Second derivative test',
      summary:
        "If $f'(c) = 0$ and $f''(c) > 0$, $f(c)$ is a local minimum; if $f''(c) < 0$, a local maximum. If $f''(c) = 0$ the test says nothing.",
      introducedIn: 'concavity-and-sketching',
    },
    {
      id: 'objective-function',
      title: 'Objective function',
      summary:
        'The quantity an optimization problem makes as large or as small as possible, written as a function of the variables it depends on. A constraint can reduce those variables to one.',
      introducedIn: 'optimization',
    },
    {
      id: 'least-squares',
      title: 'Least squares',
      tex: '\\min_c \\sum (y_i - c)^2',
      summary:
        'Choosing parameters to make the sum of squared misfits as small as possible. Fitting a single constant $c$ to data this way gives the mean.',
      introducedIn: 'optimization',
    },
  ],
})
