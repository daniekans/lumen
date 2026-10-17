import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Algebra essentials',
  description:
    'Exponents and radicals, factoring, rational expressions, equations, inequalities and absolute value.',
  order: 1,
  skills: [
    { id: 'exponents', title: 'Use the exponent laws, including zero and negative exponents' },
    { id: 'radicals', title: 'Simplify radicals and use rational exponents' },
    { id: 'factor', title: 'Factor polynomials' },
    { id: 'rational-expressions', title: 'Simplify and combine rational expressions' },
    { id: 'equations', title: 'Solve linear, quadratic and rational equations' },
    { id: 'inequalities', title: 'Solve inequalities and write the answer as intervals' },
    { id: 'absolute-value', title: 'Solve absolute value equations and inequalities' },
  ],
  terms: [
    {
      id: 'exponent',
      title: 'Exponent',
      tex: 'a^m',
      summary:
        'For a whole number $m$, $a^m$ is the product of $m$ factors equal to the base $a$. The laws $a^m a^n = a^{m + n}$ and $(a^m)^n = a^{mn}$ follow by counting factors.',
      introducedIn: 'exponent-laws',
    },
    {
      id: 'negative-exponent',
      title: 'Zero and negative exponents',
      tex: 'a^0,\\ a^{-n}',
      summary:
        'For $a \\neq 0$, $a^0 = 1$ and $a^{-n} = \\frac{1}{a^n}$, the only values that keep the quotient rule true. A negative exponent means a reciprocal.',
      introducedIn: 'exponent-laws',
    },
    {
      id: 'square-root',
      title: 'Square root',
      tex: '\\sqrt{A}',
      summary:
        'For $A \\geq 0$, the nonnegative number whose square is $A$. So $\\sqrt{25} = 5$ and $\\sqrt{x^2} = \\lvert x \\rvert$.',
      introducedIn: 'radicals',
    },
    {
      id: 'nth-root',
      title: 'Root and rational exponent',
      tex: '\\sqrt[n]{a} = a^{1/n}',
      summary:
        'The number whose $n$-th power is $a$. Rational exponents mean roots: $a^{m/n} = (\\sqrt[n]{a})^m$. Even roots of negative numbers are not real.',
      introducedIn: 'radicals',
    },
    {
      id: 'simplest-radical-form',
      title: 'Simplest radical form',
      summary:
        'No square factor left under the root and no root left in a denominator, as in $\\sqrt{72} = 6\\sqrt{2}$.',
      introducedIn: 'radicals',
    },
    {
      id: 'rationalizing',
      title: 'Rationalizing a denominator',
      summary:
        'Multiplying by $\\frac{\\sqrt{b}}{\\sqrt{b}} = 1$ to move a root out of the denominator: $\\frac{a}{\\sqrt{b}} = \\frac{a\\sqrt{b}}{b}$.',
      introducedIn: 'radicals',
    },
    {
      id: 'factoring',
      title: 'Factoring',
      summary:
        'Writing a sum as a product, such as $x^2 + 5x + 6 = (x + 2)(x + 3)$. Take out common factors first.',
      introducedIn: 'factoring-as-area',
    },
    {
      id: 'difference-of-squares',
      title: 'Difference of squares',
      tex: 'a^2 - b^2 = (a + b)(a - b)',
      summary:
        'The factorization of $a^2 - b^2$. A sum of squares has no factorization with real numbers.',
      introducedIn: 'factoring-as-area',
    },
    {
      id: 'rational-expression',
      title: 'Rational expression',
      summary:
        'A fraction whose numerator and denominator are polynomials. It is undefined where the denominator is zero, and simplifying cancels factors, never terms.',
      introducedIn: 'rational-expressions',
    },
    {
      id: 'excluded-value',
      title: 'Excluded value',
      summary:
        'An input that makes a denominator of the original expression zero, including denominators whose factor later cancels.',
      introducedIn: 'rational-expressions',
    },
    {
      id: 'hole',
      title: 'Hole',
      summary:
        'A single missing point on a graph, left by a factor that cancels from the numerator and the denominator.',
      introducedIn: 'rational-expressions',
    },
    {
      id: 'asymptote',
      title: 'Asymptote',
      summary:
        'A line that a graph approaches ever more closely. A factor that stays in the denominator gives a vertical asymptote, where the values grow without bound.',
      introducedIn: 'rational-expressions',
    },
    {
      id: 'quadratic-formula',
      title: 'Quadratic formula',
      tex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      summary: 'The solutions of $ax^2 + bx + c = 0$ with $a \\neq 0$.',
      introducedIn: 'equations-and-inequalities',
    },
    {
      id: 'discriminant',
      title: 'Discriminant',
      tex: 'b^2 - 4ac',
      summary:
        'The number under the root in the quadratic formula. Positive gives two real solutions, zero gives one, negative gives none.',
      introducedIn: 'equations-and-inequalities',
    },
    {
      id: 'extraneous-solution',
      title: 'Extraneous solution',
      summary:
        'A candidate that solves a transformed equation but not the original one. Squaring both sides or clearing a denominator can add them, so check every candidate.',
      introducedIn: 'equations-and-inequalities',
    },
    {
      id: 'sign-chart',
      title: 'Sign chart',
      summary:
        'A table of the sign of each factor on the intervals between their zeros. A product or quotient changes sign only at a zero of one of its factors.',
      introducedIn: 'equations-and-inequalities',
    },
    {
      id: 'absolute-value',
      title: 'Absolute value',
      tex: '\\lvert u \\rvert',
      summary:
        'The distance from $u$ to $0$, so $\\lvert x - a \\rvert$ is the distance from $x$ to $a$ and $\\lvert x - a \\rvert < r$ means $a - r < x < a + r$.',
      introducedIn: 'equations-and-inequalities',
    },
  ],
})
