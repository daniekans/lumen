import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Implicit and inverse derivatives',
  summary:
    "A curve given by an equation in $x$ and $y$ still has slopes. Differentiate both sides, treating $y$ as a function of $x$, and solve for $\\frac{dy}{dx}$, or differentiate in $y$ for $\\frac{dx}{dy}$. The same idea gives the slope of an inverse function, $\\frac{1}{f'}$, the derivatives of $\\arctan$ and $\\arcsin$, and logarithmic differentiation.",
  tags: [
    'implicit differentiation',
    'inverse function',
    'arctan',
    'arcsin',
    'logarithmic differentiation',
    'derivative',
  ],
  level: 'core',
  order: 11,
  skills: ['implicit-differentiation'],
  steps: [
    {
      id: 'circle',
      title: 'A circle has slopes',
      caption:
        'The circle $x^2 + y^2 = 25$ is not the graph of one function, but near $P$ it is: the highlighted arc. Differentiate both sides in $x$, with $y$ a function of $x$: $2x + 2y\\,\\frac{dy}{dx} = 0$, so $\\frac{dy}{dx} = -\\frac{x}{y}$. Drag $P$.',
      check: {
        kind: 'number',
        prompt: 'What is the slope of the circle $x^2 + y^2 = 25$ at the point $(3, 4)$?',
        answer: -0.75,
        tolerance: 0.005,
        explanation:
          '$\\frac{dy}{dx} = -\\frac{x}{y} = -\\frac{3}{4}$. The tangent is perpendicular to the radius, whose slope is $\\frac{4}{3}$.',
      },
    },
    {
      id: 'implicit',
      title: 'Differentiate both sides',
      caption:
        'On $x^2 + xy + y^2 = 3$ the middle term needs the product rule: $2x + y + x\\,\\frac{dy}{dx} + 2y\\,\\frac{dy}{dx} = 0$. Solving, $\\frac{dy}{dx} = -\\frac{2x + y}{x + 2y}$. Where $x + 2y = 0$ the tangent is vertical and the curve is not a graph $y(x)$ near that point.',
    },
    {
      id: 'in-y',
      title: 'Differentiate in y',
      caption:
        'At $(5, 0)$ the tangent is vertical and $\\frac{dy}{dx}$ does not exist. Near that point the right half of the circle is a graph $x(y)$, highlighted, and the equation holds for every $y$ on it. So differentiate both sides in $y$: $2x\\,\\frac{dx}{dy} + 2y = 0$, so $\\frac{dx}{dy} = -\\frac{y}{x}$, which is $0$ there. Where both exist, $\\frac{dx}{dy} = 1 \\big/ \\frac{dy}{dx}$. Drag $P$.',
      check: {
        kind: 'number',
        prompt: 'What is $\\frac{dx}{dy}$ on the circle $x^2 + y^2 = 25$ at the point $(4, 3)$?',
        answer: -0.75,
        tolerance: 0.005,
        explanation:
          '$\\frac{dx}{dy} = -\\frac{y}{x} = -\\frac{3}{4}$, the reciprocal of $\\frac{dy}{dx} = -\\frac{x}{y} = -\\frac{4}{3}$.',
      },
    },
    {
      id: 'inverse',
      title: 'The slope of an inverse',
      caption:
        "Reflecting the graph of $f$ in the line $y = x$ gives the graph of its inverse $f^{-1}$. The reflection swaps rise and run, so the slope at the mirrored point is the reciprocal: $\\left(f^{-1}\\right)'(f(a)) = \\frac{1}{f'(a)}$. Here $f(x) = 0.2x^3 + 0.5x + 1.5$.",
      check: {
        kind: 'number',
        prompt: "Let $f(x) = x^3 + x$, so $f(1) = 2$. What is $\\left(f^{-1}\\right)'(2)$?",
        answer: 0.25,
        tolerance: 0.005,
        explanation:
          "$f'(x) = 3x^2 + 1$, so $f'(1) = 4$. The inverse has slope $\\frac{1}{4}$ at $f(1) = 2$. Note that the slope is taken at $1$, not at $2$.",
      },
    },
    {
      id: 'arctan',
      title: 'Arctangent',
      caption:
        '$y = \\arctan x$ means $\\tan y = x$ with $-\\frac{\\pi}{2} < y < \\frac{\\pi}{2}$. Differentiate: $\\frac{1}{\\cos^2 y}\\,\\frac{dy}{dx} = 1$, so $\\frac{dy}{dx} = \\cos^2 y = \\frac{1}{1 + x^2}$, dashed. The slope is largest at $0$ and fades as the graph flattens toward $\\pm\\frac{\\pi}{2}$.',
    },
    {
      id: 'log-diff',
      title: 'Logarithmic differentiation',
      caption:
        'Neither the power rule nor the exponential rule fits $y = x^x$. Take logarithms first: $\\ln y = x \\ln x$. Differentiate: $\\frac{1}{y}\\,\\frac{dy}{dx} = \\ln x + 1$, so $\\frac{dy}{dx} = x^x(\\ln x + 1)$, dashed. The slope is $0$ at $x = \\frac{1}{e}$.',
      check: {
        kind: 'number',
        prompt: 'What is the slope of $y = x^x$ at $x = 1$?',
        answer: 1,
        tolerance: 0.005,
        explanation: '$x^x(\\ln x + 1)$ at $x = 1$ is $1 \\cdot (0 + 1) = 1$.',
      },
    },
  ],
})
