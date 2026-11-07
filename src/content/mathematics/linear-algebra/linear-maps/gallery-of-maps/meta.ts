import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'A gallery of maps',
  summary:
    'Rotation, reflection, shear, scaling and projection onto a line: the matrix of each from where $\\hat{\\imath}$ and $\\hat{\\jmath}$ land, and what each keeps (lengths, angles, areas, orientation) and loses.',
  tags: [
    'rotation matrix',
    'reflection',
    'shear',
    'scaling',
    'projection matrix',
    'linear map',
    'orientation',
  ],
  level: 'core',
  order: 5,
  skills: ['standard-maps'],
  steps: [
    {
      id: 'rotation',
      title: 'Rotation',
      caption:
        'A rotation by $\\theta$ sends $\\hat{\\imath}$ to $(\\cos\\theta, \\sin\\theta)$ on the unit circle and $\\hat{\\jmath}$ a quarter turn further, to $(-\\sin\\theta, \\cos\\theta)$. Those are the columns. The letter turns and nothing else changes. Drag $\\theta$.',
    },
    {
      id: 'reflection',
      title: 'Reflection',
      caption:
        'A reflection across a line through the origin keeps the points of the line and sends every other point to the opposite side, at the same distance. Lengths and areas stay, but the letter reads backwards, as in a mirror: orientation flips.',
    },
    {
      id: 'shear',
      title: 'Shear',
      caption:
        'A shear keeps $\\hat{\\imath}$ and moves $\\hat{\\jmath}$ to $(k, 1)$: each horizontal line slides sideways by $k$ times its height. The square becomes a parallelogram with the same base and height, so areas stay; lengths and angles change.',
    },
    {
      id: 'scaling',
      title: 'Scaling',
      caption:
        'A scaling stretches by $s_x$ across and $s_y$ up: $\\hat{\\imath} \\mapsto (s_x, 0)$, $\\hat{\\jmath} \\mapsto (0, s_y)$. The square becomes an $s_x$ by $s_y$ rectangle, so areas are multiplied by $s_xs_y$. With $s_x = s_y$ shapes and angles stay.',
    },
    {
      id: 'projection',
      title: 'Projection onto a line',
      caption:
        'Projection onto a line drops each point perpendicular to the line. At noon the sun is overhead, and a shadow on flat ground is the projection onto the ground. The plane flattens onto the line: areas become $0$, and the map cannot be undone. Drag $\\mathbf{x}$ or tilt the line.',
    },
    {
      id: 'keeps',
      title: 'What each map keeps',
      caption:
        'Pick a map and move its slider. Rotations and reflections keep lengths and angles; a shear keeps areas; a scaling keeps angles when $s_x = s_y$ and areas when $s_xs_y = 1$; a projection keeps none of them. Only the reflection flips orientation.',
    },
  ],
})
