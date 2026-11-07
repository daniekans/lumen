import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Maps in 3D',
  summary:
    'A $3 \\times 3$ matrix moves all of space, its columns where $\\hat{\\imath}$, $\\hat{\\jmath}$ and $\\hat{k}$ land. Rotations about the axes, then maps between spaces of different sizes: a $2 \\times 3$ matrix flattens space onto a plane (this stage draws that way), and a $3 \\times 2$ matrix places the plane in space as a sheet.',
  tags: ['linear map', 'matrix', '3D', 'rotation matrix', 'projection', 'non-square matrix'],
  level: 'core',
  order: 9,
  skills: ['maps-in-3d'],
  steps: [
    {
      id: 'columns',
      title: 'Three columns',
      caption:
        'A $3 \\times 3$ matrix moves all of space. Its columns are where $\\hat{\\imath}$, $\\hat{\\jmath}$ and $\\hat{k}$ land, and the unit cube lands on the box with those three edges. Grid lines stay straight, parallel and evenly spaced, as in the plane. Drag the tips of the columns.',
    },
    {
      id: 'yaw',
      title: 'Turning about the vertical axis',
      caption:
        'A drone that changes its heading (its yaw) turns about the vertical $z$-axis. $\\hat{k}$ stays where it is, while $\\hat{\\imath}$ and $\\hat{\\jmath}$ turn in the floor exactly as in the plane, so the $2 \\times 2$ rotation sits in the top-left corner of the matrix. Move $\\theta$.',
    },
    {
      id: 'axes',
      title: 'Rotations about each axis',
      caption:
        'A rotation about the $x$-axis keeps $\\hat{\\imath}$ and turns $\\hat{\\jmath}$ and $\\hat{k}$; about the $y$-axis it keeps $\\hat{\\jmath}$. Each matrix has a $1$ for the axis it keeps and a $2 \\times 2$ rotation in the other two rows and columns. Pick an axis and move $\\theta$.',
    },
    {
      id: 'flatten',
      title: 'From space to the plane',
      caption:
        'A $2 \\times 3$ matrix takes vectors of space to the plane. Dropping the height, $(x, y, z) \\mapsto (x, y)$, has rows $(1, 0, 0)$ and $(0, 1, 0)$. Here the output plane is drawn as the floor: space falls onto it, and $\\hat{k}$ lands on $\\mathbf{0}$.',
    },
    {
      id: 'camera',
      title: 'The matrix of this stage',
      caption:
        "This stage draws space on a flat screen with a $2 \\times 3$ matrix $P$. The rows of $P$ are the screen's right and up directions in space, $\\mathbf{r}$ and $\\mathbf{u}$, so $P\\mathbf{x} = (\\mathbf{r} \\cdot \\mathbf{x}, \\mathbf{u} \\cdot \\mathbf{x})$ is where $\\mathbf{x}$ appears: that far right, then that far up. Orbit the view (drag the background): $\\mathbf{r}$ and $\\mathbf{u}$ always point right and up on the screen, while $P$ changes.",
    },
    {
      id: 'embed',
      title: 'From the plane into space',
      caption:
        'A $3 \\times 2$ matrix takes the plane into space. Its two columns are where $\\hat{\\imath}$ and $\\hat{\\jmath}$ land, and the whole grid of the plane lands on the sheet they span, a plane through the origin. Drag the columns.',
    },
  ],
})
