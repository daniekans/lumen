import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Linear maps',
  summary:
    'A map moves every point of the plane. It is linear when it keeps sums and multiples: $T(\\mathbf{u} + \\mathbf{v}) = T(\\mathbf{u}) + T(\\mathbf{v})$ and $T(c\\mathbf{v}) = cT(\\mathbf{v})$. A shift and a bend break the rules; a map that flattens the plane onto a line keeps them.',
  tags: ['linear map', 'linear transformation', 'function', 'affine', 'origin'],
  level: 'core',
  order: 1,
  skills: ['linear-maps'],
  steps: [
    {
      id: 'map',
      title: 'A map moves every point',
      caption:
        'A map $T$ of the plane sends each input $\\mathbf{u}$ to an output $T(\\mathbf{u})$, and the whole grid moves with it. Drag $\\mathbf{u}$.',
    },
    {
      id: 'sum',
      title: 'Sums go to sums',
      caption:
        'Move $\\mathbf{u}$ and $\\mathbf{v}$, add them, then map the sum. For this $T$ the result is always $T(\\mathbf{u}) + T(\\mathbf{v})$: the parallelogram of the inputs lands on the parallelogram of the outputs.',
    },
    {
      id: 'scale',
      title: 'Multiples go to multiples',
      caption:
        'Scale $\\mathbf{v}$ by $c$, then map it: $T(c\\mathbf{v}) = cT(\\mathbf{v})$ for every $c$, negative too. A map with both rules, for all vectors and all scalars, is linear.',
    },
    {
      id: 'grid',
      title: 'The picture of the rules',
      caption:
        'Because of the two rules, this map keeps the origin in place, and grid lines stay straight, parallel and evenly spaced. That is what linearity looks like for a map that does not flatten the plane.',
    },
    {
      id: 'shift',
      title: 'A shift is not linear',
      caption:
        'Shifting every point by $\\mathbf{b} = (0.5, 1.5)$ keeps the grid straight, but $T(\\mathbf{0}) = \\mathbf{b}$, and $T(\\mathbf{u}) + T(\\mathbf{v})$ counts the shift twice: it misses $T(\\mathbf{u} + \\mathbf{v})$ by $\\mathbf{b}$, in red.',
    },
    {
      id: 'bend',
      title: 'A bend is not linear',
      caption:
        'The map $(x, y) \\mapsto (x, y + \\frac{x^2}{4})$ keeps the origin but bends the horizontal grid lines into parabolas. Doubling $\\mathbf{v}$ quadruples the bend, so $T(c\\mathbf{v}) \\ne cT(\\mathbf{v})$. Fixing the origin is not enough.',
    },
    {
      id: 'collapse',
      title: 'A collapse can be linear',
      caption:
        'This map flattens the whole plane onto the line $y = \\frac{x}{2}$. Grid lines land on that line, and both rules still hold: a linear map may lose a direction. Switch between the rules.',
    },
  ],
})
