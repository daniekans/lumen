import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Polynomial and rational functions',
  description:
    'Lines and parabolas as the first polynomials, completing the square, end behavior, zeros and their multiplicity, and asymptotes.',
  order: 3,
  skills: [
    { id: 'lines', title: 'Find slopes and equations of lines' },
    { id: 'quadratics', title: 'Complete the square and read the vertex of a parabola' },
    { id: 'end-behavior', title: 'Predict the end behavior of a polynomial from its leading term' },
    { id: 'zeros', title: 'Read zeros, multiplicities and turning points' },
    { id: 'asymptotes', title: 'Find the asymptotes and holes of a rational function' },
  ],
  terms: [
    {
      id: 'slope',
      title: 'Slope',
      tex: 'm = \\frac{\\Delta y}{\\Delta x}',
      summary:
        'The rise over the run between any two points of a line, $\\frac{y_2 - y_1}{x_2 - x_1}$. A line is $y = mx + b$, with slope $m$ and $y$-intercept $b$.',
      introducedIn: 'lines-and-parabolas',
    },
    {
      id: 'vertex-form',
      title: 'Vertex form',
      tex: 'a(x - h)^2 + k',
      summary:
        'A quadratic written to show its vertex $(h, k)$: the graph of $ax^2$ moved right by $h$ and up by $k$. The axis of symmetry is $x = h$.',
      introducedIn: 'lines-and-parabolas',
    },
    {
      id: 'completing-the-square',
      title: 'Completing the square',
      tex: 'x^2 + bx = \\left(x + \\tfrac{b}{2}\\right)^2 - \\tfrac{b^2}{4}',
      summary:
        'Rewriting $x^2 + bx$ as a square minus a constant, which turns $ax^2 + bx + c$ into vertex form. The vertex is at $x = -\\frac{b}{2a}$.',
      introducedIn: 'lines-and-parabolas',
    },
    {
      id: 'polynomial',
      title: 'Polynomial',
      tex: 'a_n x^n + \\dots + a_1 x + a_0',
      summary:
        'A sum of whole number powers of $x$ with constant coefficients. The highest power $n$ with $a_n \\neq 0$ is the degree, and $a_n$ is the leading coefficient.',
      introducedIn: 'polynomial-graphs',
    },
    {
      id: 'end-behavior',
      title: 'End behavior',
      summary:
        'What a graph does as $x \\to \\pm\\infty$. For a polynomial it is the behavior of the leading term $a_n x^n$: the degree decides whether both ends agree, the sign of $a_n$ which way they go.',
      introducedIn: 'polynomial-graphs',
    },
    {
      id: 'multiplicity',
      title: 'Multiplicity of a zero',
      summary:
        'The number of times a factor $(x - r)$ divides a polynomial. At an odd multiplicity the graph crosses the axis, at an even one it touches and turns back.',
      introducedIn: 'polynomial-graphs',
    },
    {
      id: 'turning-point',
      title: 'Turning point',
      summary:
        'A point where a graph changes from increasing to decreasing or back. A polynomial of degree $n$ has at most $n - 1$ of them.',
      introducedIn: 'polynomial-graphs',
    },
    {
      id: 'rational-function',
      title: 'Rational function',
      tex: '\\frac{p(x)}{q(x)}',
      summary:
        'A quotient of two polynomials. It is defined wherever $q(x) \\neq 0$; zeros of $q$ give vertical asymptotes or holes.',
      introducedIn: 'rational-functions',
    },
    {
      id: 'horizontal-asymptote',
      title: 'Horizontal asymptote',
      summary:
        'The line $y = L$ that a graph approaches as $x \\to \\pm\\infty$. For $\\frac{p}{q}$: $y = 0$ if $\\deg p < \\deg q$, the ratio of leading coefficients if the degrees are equal, none if $\\deg p > \\deg q$.',
      introducedIn: 'rational-functions',
    },
    {
      id: 'slant-asymptote',
      title: 'Slant asymptote',
      summary:
        'When $\\deg p = \\deg q + 1$, long division gives $\\frac{p}{q} = mx + b + \\frac{r}{q}$, and the graph approaches the line $y = mx + b$.',
      introducedIn: 'rational-functions',
    },
  ],
})
