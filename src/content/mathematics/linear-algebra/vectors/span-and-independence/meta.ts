import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Span and independence',
  summary:
    'The span of a set of vectors is every linear combination of them. In space one vector spans a line, two a plane, three all of space, unless a vector lies in the span of the others and adds nothing. Such a set is dependent: some combination with weights not all zero gives the zero vector.',
  tags: [
    'span',
    'linear independence',
    'linear dependence',
    'linear combination',
    'plane through the origin',
    '3D',
  ],
  level: 'core',
  order: 6,
  skills: ['span-and-independence'],
  steps: [
    {
      id: 'one',
      title: 'One vector: a line',
      caption:
        'The combinations of a single nonzero vector are its multiples $a\\mathbf{v}$, which fill the line through the origin along $\\mathbf{v}$: its span. Drag the background to turn the view.',
    },
    {
      id: 'two',
      title: 'Two vectors: a plane',
      caption:
        'The combinations $a\\mathbf{v} + b\\mathbf{w}$ of two vectors that are not parallel fill a plane through the origin, with a grid of whole-number weights as in the plane. Move $a$ and $b$.',
    },
    {
      id: 'in-plane',
      title: 'A third vector in the plane',
      caption:
        'Here $\\mathbf{u} = \\mathbf{v} + \\mathbf{w}$ lies in that plane, as the edge-on view shows. Every combination of $\\mathbf{v}$, $\\mathbf{w}$, $\\mathbf{u}$ is already a combination of $\\mathbf{v}$ and $\\mathbf{w}$, so the span is still the plane.',
    },
    {
      id: 'redundant',
      title: 'Back to zero',
      caption:
        'Since $\\mathbf{u} = \\mathbf{v} + \\mathbf{w}$, the combination $\\mathbf{v} + \\mathbf{w} - \\mathbf{u}$ is $\\mathbf{0}$: the three arrows, tip to tail, return to the origin. Weights not all zero that give $\\mathbf{0}$ make the set linearly dependent.',
    },
    {
      id: 'space',
      title: 'Out of the plane: all of space',
      caption:
        'Lift $\\mathbf{u}$ off the plane. Each $c$ gives a copy of the plane shifted by $c\\mathbf{u}$, and together they fill space. Now only $0\\mathbf{v} + 0\\mathbf{w} + 0\\mathbf{u}$ gives $\\mathbf{0}$: the set is linearly independent. Drag the tip of $\\mathbf{u}$.',
    },
  ],
})
