import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Derivatives',
  description:
    'The derivative as a limit, differentiation rules, the chain rule and implicit differentiation.',
  order: 2,
  skills: [
    { id: 'secant-slope', title: 'Average rate of change as a secant slope' },
    { id: 'definition', title: 'The derivative as a limit of difference quotients' },
    {
      id: 'derivative-graphs',
      title: "Read f' from the graph of f and find where f is not differentiable",
    },
    {
      id: 'basic-rules',
      title: 'Differentiate with the power, sum, constant multiple, product and quotient rules',
    },
    {
      id: 'motion',
      title: 'Find velocity and acceleration from position, and tell speeding up from slowing down',
    },
    {
      id: 'transcendental-derivatives',
      title: 'Differentiate exponentials, logarithms and trigonometric functions',
    },
    { id: 'chain-rule', title: 'Differentiate compositions with the chain rule' },
    {
      id: 'implicit-differentiation',
      title:
        'Find slopes of implicit curves and inverse functions, and use logarithmic differentiation',
    },
    { id: 'related-rates', title: 'Relate the rates of change of linked quantities' },
  ],
  terms: [
    {
      id: 'difference-quotient',
      title: 'Difference quotient',
      tex: '\\frac{f(x_0 + h) - f(x_0)}{h}',
      summary:
        'The slope of the secant line through $(x_0, f(x_0))$ and $(x_0 + h, f(x_0 + h))$: the average rate of change of $f$ over that step.',
      introducedIn: 'derivative-as-limit',
    },
    {
      id: 'derivative',
      title: 'Derivative',
      tex: "f'(x_0)",
      summary:
        "The limit of the difference quotient as $h \\to 0$, when it exists: the instantaneous rate of change. Computed at every point, it is a new function $f'$.",
      introducedIn: 'derivative-as-limit',
    },
    {
      id: 'tangent-line',
      title: 'Tangent line',
      summary:
        "The line through $(x_0, f(x_0))$ with slope $f'(x_0)$, the limit of the secant lines as the second point approaches the first.",
      introducedIn: 'derivative-as-limit',
    },
    {
      id: 'differentiable',
      title: 'Differentiable',
      summary:
        "$f$ is differentiable at $a$ when $f'(a)$ exists: the difference quotient has the same finite limit from both sides. A differentiable function is continuous there, but not the other way around.",
      introducedIn: 'derivative-as-limit',
    },
    {
      id: 'leibniz-notation',
      title: 'Leibniz notation',
      tex: '\\frac{dy}{dx}',
      summary:
        "With $y = f(x)$, the derivative written as $\\frac{dy}{dx} = \\lim_{\\Delta x \\to 0} \\frac{\\Delta y}{\\Delta x}$. For now one symbol for that limit, equal to $f'(x)$.",
      introducedIn: 'derivative-as-limit',
    },
    {
      id: 'locally-linear',
      title: 'Locally linear',
      summary:
        'A function is locally linear at a point when its graph, magnified around that point, becomes indistinguishable from a line: its tangent. Differentiable functions are locally linear.',
      introducedIn: 'derivative-as-limit',
    },
    {
      id: 'derivative-function',
      title: 'Derivative function',
      tex: "f'",
      summary:
        "The function $x \\mapsto f'(x)$, defined wherever $f$ is differentiable. Its sign tells where $f$ rises or falls; its zeros are the flat tangents.",
      introducedIn: 'derivative-function',
    },
    {
      id: 'differentiation-operator',
      title: 'Differentiation operator',
      tex: '\\frac{d}{dx}',
      summary:
        "The operation that takes a function to its derivative: $\\frac{d}{dx} f(x) = f'(x)$, as in $\\frac{d}{dx}\\left(x^2\\right) = 2x$.",
      introducedIn: 'derivative-function',
    },
    {
      id: 'corner-and-cusp',
      title: 'Corner, cusp and vertical tangent',
      summary:
        'Three ways a continuous function fails to be differentiable: one-sided slopes that differ (corner), that go to $\\infty$ and $-\\infty$ (cusp), or to $\\infty$ on both sides (vertical tangent).',
      introducedIn: 'derivative-function',
    },
    {
      id: 'power-rule',
      title: 'Power rule',
      tex: '\\frac{d}{dx}\\left(x^n\\right) = nx^{n-1}',
      summary:
        'The derivative of $x^n$ is $nx^{n-1}$. Proved here for whole numbers $n$ by expanding $(x + h)^n$; it holds for every real exponent $n$ when $x > 0$, as later items show.',
      introducedIn: 'power-and-sum-rules',
    },
    {
      id: 'linearity-of-the-derivative',
      title: 'Linearity of the derivative',
      tex: "(af + bg)' = af' + bg'",
      summary:
        'The derivative of a sum is the sum of the derivatives, and constants factor out. Together they let a polynomial be differentiated term by term.',
      introducedIn: 'power-and-sum-rules',
    },
    {
      id: 'velocity',
      title: 'Velocity',
      tex: 'v = \\frac{ds}{dt}',
      summary:
        'The derivative of position $s(t)$ in time: the instantaneous rate of change of position, the limit of average velocities $\\frac{\\Delta s}{\\Delta t}$. Its sign gives the direction of motion, and its absolute value is the speed.',
      introducedIn: 'motion',
    },
    {
      id: 'acceleration',
      title: 'Acceleration',
      tex: 'a = \\frac{dv}{dt}',
      summary:
        'The derivative of velocity in time, and so the second derivative of position: $a = \\frac{d^2s}{dt^2}$. When $v$ and $a$ have the same sign the speed grows; when their signs differ it shrinks.',
      introducedIn: 'motion',
    },
    {
      id: 'second-derivative',
      title: 'Second derivative',
      tex: "f''",
      summary:
        "The derivative of the derivative: $f'' = (f')'$, written $\\frac{d^2y}{dx^2}$ in Leibniz notation. It measures how fast the slope changes.",
      introducedIn: 'motion',
    },
    {
      id: 'product-rule',
      title: 'Product rule',
      tex: "(fg)' = f'g + fg'",
      summary:
        'The derivative of a product: each factor changes while the other stays fixed, like the two strips added to a growing rectangle.',
      introducedIn: 'product-and-quotient-rules',
    },
    {
      id: 'quotient-rule',
      title: 'Quotient rule',
      tex: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}",
      summary:
        'The derivative of a quotient where $g \\neq 0$, found by applying the product rule to $f = \\frac{f}{g} \\cdot g$.',
      introducedIn: 'product-and-quotient-rules',
    },
    {
      id: 'exponential-derivative',
      title: 'Derivatives of exponentials and logarithms',
      tex: '\\frac{d}{dx}e^x = e^x',
      summary:
        '$e^x$ is its own derivative, $\\frac{d}{dx}b^x = (\\ln b)\\,b^x$, and $\\frac{d}{dx}\\ln x = \\frac{1}{x}$ for $x > 0$.',
      introducedIn: 'exp-log-and-trig-derivatives',
    },
    {
      id: 'trig-derivatives',
      title: 'Derivatives of sine and cosine',
      tex: '\\frac{d}{dx}\\sin x = \\cos x',
      summary:
        "With $x$ in radians, $\\sin' = \\cos$ and $\\cos' = -\\sin$: on the unit circle the point moves at right angles to the radius. The quotient rule gives $\\tan' = \\sec^2$.",
      introducedIn: 'exp-log-and-trig-derivatives',
    },
    {
      id: 'chain-rule',
      title: 'Chain rule',
      tex: '\\frac{dy}{dx} = \\frac{dy}{du}\\frac{du}{dx}',
      summary:
        "The derivative of a composition: $(f \\circ g)'(x) = f'(g(x))\\,g'(x)$, the outer derivative at the inner value times the inner derivative. Stretch factors multiply.",
      introducedIn: 'chain-rule',
    },
    {
      id: 'implicit-differentiation',
      title: 'Implicit differentiation',
      summary:
        'Finding $\\frac{dy}{dx}$ on a curve given by an equation in $x$ and $y$: differentiate both sides in $x$, with $y$ a function of $x$ (each $y$ term gets a factor $\\frac{dy}{dx}$), and solve for $\\frac{dy}{dx}$.',
      introducedIn: 'implicit-and-inverse',
    },
    {
      id: 'inverse-derivative',
      title: 'Derivative of an inverse function',
      tex: "\\left(f^{-1}\\right)'(f(a)) = \\frac{1}{f'(a)}",
      summary:
        "Reflecting a graph in $y = x$ swaps rise and run, so the inverse has the reciprocal slope at the mirrored point, when $f'(a) \\neq 0$. It gives $\\frac{d}{dx}\\arctan x = \\frac{1}{1 + x^2}$ and $\\frac{d}{dx}\\arcsin x = \\frac{1}{\\sqrt{1 - x^2}}$.",
      introducedIn: 'implicit-and-inverse',
    },
    {
      id: 'logarithmic-differentiation',
      title: 'Logarithmic differentiation',
      summary:
        'Differentiating $\\ln y$ instead of $y$ for a positive function: the logarithm turns products, quotients and powers into sums, and $\\frac{d}{dx}\\ln y = \\frac{1}{y}\\frac{dy}{dx}$. It handles $x^x$.',
      introducedIn: 'implicit-and-inverse',
    },
    {
      id: 'related-rates',
      title: 'Related rates',
      summary:
        'When quantities are linked by an equation at every moment, differentiating it in time $t$ links their rates. Knowing some rates at an instant gives the others.',
      introducedIn: 'related-rates',
    },
  ],
})
