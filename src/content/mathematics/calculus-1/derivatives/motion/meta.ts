import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Motion: velocity and acceleration',
  summary:
    'A ball thrown upward has a position $s(t)$ at every moment. Its average velocity over a time interval is a secant slope, and the speedometer reading is the limit: $v = \\frac{ds}{dt}$. Differentiating again gives the acceleration $a = \\frac{dv}{dt} = \\frac{d^2s}{dt^2}$, the second derivative, and the signs of $v$ and $a$ tell whether the ball speeds up or slows down.',
  tags: [
    'velocity',
    'acceleration',
    'motion',
    'second derivative',
    'rate of change',
    'Leibniz notation',
  ],
  level: 'core',
  order: 5,
  skills: ['motion'],
  steps: [
    {
      id: 'position',
      title: 'Position over time',
      caption:
        'A ball is thrown straight up at $19.6$ meters per second. Gravity slows it, and its height after $t$ seconds is $s(t) = 19.6t - 4.9t^2$ meters. The ball moves on the track at the left; the graph records its height at every moment.',
    },
    {
      id: 'average',
      title: 'Average velocity',
      caption:
        'Over the interval from $t$ to $t + \\Delta t$ the ball rises $\\Delta s$ meters. The average velocity $\\frac{\\Delta s}{\\Delta t}$ is the slope of the secant, in meters per second: change in meters over change in seconds.',
      check: {
        kind: 'number',
        prompt:
          'What is the average velocity of the ball, in meters per second, from $t = 0$ to $t = 1$?',
        answer: 14.7,
        tolerance: 0.005,
        explanation:
          '$s(1) = 19.6 - 4.9 = 14.7$ and $s(0) = 0$, so $\\frac{\\Delta s}{\\Delta t} = \\frac{14.7}{1} = 14.7$ meters per second.',
      },
    },
    {
      id: 'instant',
      title: 'The speedometer reading',
      caption:
        'Shrink $\\Delta t$. The average velocity tends to the slope of the tangent, the velocity at the instant $t$: $v(t) = \\frac{ds}{dt} = 19.6 - 9.8t$. Its units are still meters per second, as the notation says.',
      check: {
        kind: 'number',
        prompt: 'What is the velocity of the ball, in meters per second, at $t = 1$?',
        answer: 9.8,
        tolerance: 0.005,
        explanation:
          "$v(t) = s'(t) = 19.6 - 9.8t$, so $v(1) = 9.8$ meters per second, less than the average $14.7$ over the first second: the ball is slowing down.",
      },
    },
    {
      id: 'velocity',
      title: 'Velocity as a function',
      caption:
        'Computed at every instant, the velocity is a new function, drawn in teal. Positive means the ball moves up, negative means down. At the top it is $0$ for an instant: the tangent to $s$ is flat.',
      check: {
        kind: 'number',
        prompt: 'At what time, in seconds, does the ball reach its highest point?',
        answer: 2,
        tolerance: 0.005,
        explanation:
          '$v(t) = 19.6 - 9.8t = 0$ at $t = 2$. The height there is $s(2) = 39.2 - 19.6 = 19.6$ meters.',
      },
    },
    {
      id: 'acceleration',
      title: 'Acceleration',
      caption:
        "The velocity changes too, at the rate $a = \\frac{dv}{dt} = -9.8$ meters per second per second: gravity. It is the derivative of the derivative, $\\frac{d^2s}{dt^2}$ or $s''(t)$. When $v$ and $a$ have the same sign the ball speeds up; opposite signs, it slows down.",
      check: {
        kind: 'choice',
        prompt: 'At $t = 3$ the ball is:',
        options: [
          'Moving up and slowing down',
          'Moving down and slowing down',
          'Moving down and speeding up',
          'Moving up and speeding up',
        ],
        answer: 2,
        explanation:
          '$v(3) = 19.6 - 29.4 = -9.8 < 0$, so the ball moves down, and $a = -9.8$ has the same sign, so its speed $\\lvert v \\rvert$ grows.',
      },
    },
  ],
})
