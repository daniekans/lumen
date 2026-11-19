import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: "L'Hôpital's rule",
  summary:
    "Near $a$, two functions that vanish there look like their tangent lines, so their ratio behaves like the ratio of the slopes. L'Hôpital's rule turns $\\frac{0}{0}$ and $\\frac{\\infty}{\\infty}$ into a limit of $\\frac{f'}{g'}$, under conditions; logarithms bring $0 \\cdot \\infty$, $0^0$ and $1^\\infty$ to it.",
  tags: [
    "L'Hôpital's rule",
    'indeterminate form',
    "Cauchy's mean value theorem",
    'limit',
    'continuous compounding',
  ],
  level: 'core',
  order: 8,
  codeCorner: 'bottom-right',
  skills: ['lhopital'],
  steps: [
    {
      id: 'zero-over-zero',
      title: 'Two functions that vanish',
      caption:
        '$f(x) = \\ln x$ and $g(x) = x^2 - 1$ are both $0$ at $x = 1$, so the ratio $\\frac{f(x)}{g(x)}$ is $\\frac{0}{0}$ there. Near $1$ the ratio, in purple, approaches $\\frac{1}{2}$. Drag $x$.',
    },
    {
      id: 'tangents',
      title: 'Two tangent lines',
      caption:
        "Zoomed in, each curve is nearly its tangent: $f(x) \\approx 1 \\cdot (x - 1)$ and $g(x) \\approx 2(x - 1)$. The factor $x - 1$ cancels, so $\\frac{f(x)}{g(x)} \\approx \\frac{f'(1)}{g'(1)} = \\frac{1}{2}$.",
    },
    {
      id: 'cauchy',
      title: 'The curve of pairs',
      caption:
        "Plot the point $P = (g(x), f(x))$. The line from the origin to $P$ has slope $\\frac{f(x)}{g(x)}$, and some tangent in between is parallel to it, with slope $\\frac{f'(c)}{g'(c)}$. As $x \\to 1$, $c \\to 1$ too.",
    },
    {
      id: 'infinity',
      title: 'Infinity over infinity',
      caption:
        '$\\frac{x^2}{e^x}$ is $\\frac{\\infty}{\\infty}$ as $x \\to \\infty$, and the rule applies to that form too. $\\frac{2x}{e^x}$ is still $\\frac{\\infty}{\\infty}$; once more gives $\\frac{2}{e^x}$, which tends to $0$. So do the other two.',
    },
    {
      id: 'fails',
      title: 'When the rule says nothing',
      caption:
        "$\\frac{x + \\sin x}{x}$ tends to $1$, but the ratio of the derivatives, $1 + \\cos x$, keeps swinging between $0$ and $2$. The rule needs the limit of $\\frac{f'}{g'}$; when it does not exist, the rule gives no answer.",
    },
    {
      id: 'logs',
      title: 'Zero to the zero by a logarithm',
      caption:
        'As $x \\to 0^+$, $x^x$ has the form $0^0$. Its logarithm $x \\ln x$ is $0 \\cdot \\infty$, which becomes $\\frac{\\ln x}{1 / x}$, an $\\frac{\\infty}{\\infty}$ form that tends to $0$. So $x^x \\to e^0 = 1$.',
    },
    {
      id: 'compounding',
      title: 'Compounding, one to the infinity',
      caption:
        'At a yearly rate $r$ paid $n$ times a year, 1 dollar grows to $(1 + rh)^{1/h}$ in a year, with $h = \\frac{1}{n}$. Its logarithm $\\frac{\\ln(1 + rh)}{h}$ is $\\frac{0}{0}$ and tends to $r$, so the amount tends to $e^r$. Change $r$.',
    },
    {
      id: 'circular',
      title: 'A circular argument',
      caption:
        "The rule gives $\\lim_{x \\to 0} \\frac{\\sin x}{x} = \\cos 0 = 1$, but it uses $\\sin'(0) = 1$, the slope of the teal tangent, and that slope was computed from this very limit. The squeeze theorem proved it; the rule cannot.",
    },
  ],
})
