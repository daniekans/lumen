import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Functions',
  description:
    'What a function is, domain and range, reading graphs, composition, inverses and transformations.',
  order: 2,
  skills: [
    { id: 'definition', title: 'Tell whether a relation is a function' },
    { id: 'evaluate', title: 'Evaluate a function from a formula, a table or a graph' },
    { id: 'domain-range', title: 'Find the domain and range' },
    { id: 'compose', title: 'Compose functions' },
    { id: 'inverse', title: 'Find and recognize inverse functions' },
    { id: 'transform', title: 'Shift, stretch and reflect graphs' },
  ],
  terms: [
    {
      id: 'function',
      title: 'Function',
      tex: 'f(x)',
      summary:
        'A rule that assigns to each input $x$ exactly one output $f(x)$. Two inputs may share an output; one input may not have two.',
      introducedIn: 'function-as-mapping',
    },
    {
      id: 'graph-of-function',
      title: 'Graph of a function',
      tex: '(x, f(x))',
      summary: 'The set of points $(x, f(x))$ for every input $x$ in the domain.',
      introducedIn: 'function-as-mapping',
    },
    {
      id: 'vertical-line-test',
      title: 'Vertical line test',
      summary:
        'A curve is the graph of a function of $x$ exactly when no vertical line meets it more than once.',
      introducedIn: 'function-as-mapping',
    },
    {
      id: 'domain',
      title: 'Domain',
      summary:
        'The set of inputs for which $f(x)$ is defined. Without a stated domain, every real number for which the formula makes sense.',
      introducedIn: 'domain-and-range',
    },
    {
      id: 'range',
      title: 'Range',
      summary:
        'The set of outputs that occur, $\\{ f(x) : x \\text{ in the domain} \\}$. A value $c$ is in it exactly when $f(x) = c$ has a solution.',
      introducedIn: 'domain-and-range',
    },
    {
      id: 'interval-notation',
      title: 'Interval notation',
      tex: '[a, b),\\ (a, \\infty)',
      summary:
        'A square bracket includes the endpoint, a parenthesis excludes it, and $\\infty$ always gets a parenthesis. Gaps are written as unions with $\\cup$.',
      introducedIn: 'domain-and-range',
    },
    {
      id: 'increasing-decreasing',
      title: 'Increasing and decreasing',
      summary:
        '$f$ is increasing on an interval if $x_1 < x_2$ implies $f(x_1) < f(x_2)$ there, and decreasing if it implies $f(x_1) > f(x_2)$.',
      introducedIn: 'reading-graphs',
    },
    {
      id: 'maximum-minimum',
      title: 'Maximum and minimum',
      tex: '\\max f,\\ \\min f',
      summary:
        'The largest and the smallest output of a function. Ends of the domain count, not only peaks and valleys.',
      introducedIn: 'reading-graphs',
    },
    {
      id: 'composition',
      title: 'Composition',
      tex: 'f \\circ g',
      summary:
        '$(f \\circ g)(x) = f(g(x))$: apply $g$ first, then $f$. The order matters, and $g(x)$ must be in the domain of $f$.',
      introducedIn: 'composition',
    },
    {
      id: 'inverse-function',
      title: 'Inverse function',
      tex: 'f^{-1}',
      summary:
        'The function that undoes $f$: $f^{-1}(f(x)) = x$. Its graph is the reflection of the graph of $f$ across $y = x$. Not the same as $\\frac{1}{f}$.',
      introducedIn: 'inverses',
    },
    {
      id: 'one-to-one',
      title: 'One-to-one',
      summary:
        'Different inputs give different outputs. A function has an inverse exactly when it is one-to-one.',
      introducedIn: 'inverses',
    },
    {
      id: 'horizontal-line-test',
      title: 'Horizontal line test',
      summary:
        'A function is one-to-one exactly when no horizontal line meets its graph more than once.',
      introducedIn: 'inverses',
    },
    {
      id: 'graph-transformation',
      title: 'Graph transformation',
      tex: 'a\\,f\\big(b(x - h)\\big) + k',
      summary:
        'Outside numbers act on outputs and move the graph vertically; inside numbers act on inputs and move it horizontally, against the sign. A point $(x_0, y_0)$ moves to $(\\frac{x_0}{b} + h, a y_0 + k)$.',
      introducedIn: 'transformations',
    },
  ],
})
