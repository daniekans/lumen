import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Exponential and logarithmic functions',
  description:
    'Growth and decay by a constant factor, the number e and continuous growth, logarithms as inverses with their laws, and equations with an unknown exponent.',
  order: 4,
  skills: [
    { id: 'exponential-models', title: 'Model growth and decay with exponential functions' },
    { id: 'natural-exponential', title: 'Use the number e and continuous growth' },
    { id: 'logarithms', title: 'Evaluate logarithms and apply their laws' },
    { id: 'exp-log-equations', title: 'Solve exponential and logarithmic equations' },
  ],
  terms: [
    {
      id: 'exponential-function',
      title: 'Exponential function',
      tex: 'a \\cdot b^x',
      summary:
        'A function that multiplies by the same factor $b > 0$, $b \\neq 1$, over every step of $1$ in $x$. It grows for $b > 1$, decays for $b < 1$, and $a$ is its value at $x = 0$.',
      introducedIn: 'exponential-growth',
    },
    {
      id: 'growth-factor',
      title: 'Growth factor',
      summary:
        'The base $b$ of $a \\cdot b^x$: the factor each step of $1$ multiplies by. A rate of $r$ per step gives $b = 1 + r$, so $5\\%$ growth is $1.05$ and $20\\%$ decay is $0.8$.',
      introducedIn: 'exponential-growth',
    },
    {
      id: 'doubling-time',
      title: 'Doubling time',
      summary:
        'The time $d$ with $b^d = 2$, after which an exponential has doubled, from any starting point. For continuous growth at rate $r$ it is $\\frac{\\ln 2}{r}$.',
      introducedIn: 'exponential-growth',
    },
    {
      id: 'half-life',
      title: 'Half-life',
      summary:
        'The time $h$ after which a decaying quantity has halved, from any starting point. The amount left after $t$ is $A_0 \\left(\\frac{1}{2}\\right)^{t / h}$.',
      introducedIn: 'exponential-growth',
    },
    {
      id: 'euler-number',
      title: 'The number e',
      tex: 'e \\approx 2.71828',
      summary:
        'The limit of $\\left(1 + \\frac{1}{n}\\right)^n$ as $n \\to \\infty$, and the one base whose exponential has slope $1$ at $x = 0$. The slope of $e^x$ equals its height everywhere.',
      introducedIn: 'the-number-e',
    },
    {
      id: 'continuous-compounding',
      title: 'Continuous growth',
      tex: 'Pe^{rt}',
      summary:
        'Growth at a rate $r$ compounded continuously: the limit of $\\left(1 + \\frac{r}{n}\\right)^{nt}$ as $n \\to \\infty$. A negative $r$ is continuous decay.',
      introducedIn: 'the-number-e',
    },
    {
      id: 'logarithm',
      title: 'Logarithm',
      tex: '\\log_b x',
      summary:
        'The power $b$ must be raised to in order to give $x$: $\\log_b x = y$ means $b^y = x$. It is the inverse of $b^x$, defined for $x > 0$.',
      introducedIn: 'logarithms',
    },
    {
      id: 'natural-logarithm',
      title: 'Natural logarithm',
      tex: '\\ln x',
      summary:
        'The logarithm with base $e$, the inverse of $e^x$. $\\log x$ often means base $10$.',
      introducedIn: 'logarithms',
    },
    {
      id: 'logarithm-laws',
      title: 'Logarithm laws',
      tex: '\\log_b (uv) = \\log_b u + \\log_b v',
      summary:
        'The exponent laws read backward: products become sums, quotients differences, and $\\log_b (u^k) = k \\log_b u$. There is no law for $\\log_b (u + v)$.',
      introducedIn: 'logarithms',
    },
    {
      id: 'change-of-base',
      title: 'Change of base',
      tex: '\\log_b x = \\frac{\\ln x}{\\ln b}',
      summary:
        'Every logarithm is the natural logarithm scaled by the constant $\\frac{1}{\\ln b}$, so a calculator needs only $\\ln$.',
      introducedIn: 'logarithms',
    },
  ],
})
