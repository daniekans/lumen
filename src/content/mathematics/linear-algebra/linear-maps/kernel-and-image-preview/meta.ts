import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Kernel and image',
  summary:
    "What a map sends to $\\mathbf{0}$ (the kernel) and what it can reach (the image, the span of the columns). The rank is the dimension of the image. Inputs that differ by a kernel vector share an output: a shadow loses the direction of the light, and redundant features leave a model's weights undetermined.",
  tags: ['kernel', 'image', 'rank', 'subspace', 'null space', 'column space', 'linear map'],
  level: 'core',
  order: 10,
  skills: ['kernel-and-image'],
  steps: [
    {
      id: 'image',
      title: 'Where the plane lands',
      caption:
        'The columns of this $A$, $(1, 0.5)$ and $(2, 1)$, lie on one line. Every output $A\\mathbf{x} = x\\mathbf{a}_1 + y\\mathbf{a}_2$ is a combination of them, so the whole plane lands on that line, the image of $A$. Its dimension, $1$, is the rank of $A$.',
    },
    {
      id: 'kernel',
      title: 'What lands on zero',
      caption:
        'Since $\\mathbf{a}_2 = 2\\mathbf{a}_1$, the input $(2, -1)$ gives $2\\mathbf{a}_1 - \\mathbf{a}_2 = \\mathbf{0}$, and so does every multiple of it. That line of inputs, the kernel of $A$, is squashed to the origin.',
    },
    {
      id: 'same-output',
      title: 'Inputs that share an output',
      caption:
        'Adding a kernel vector does not change the output: $A(\\mathbf{x} + t\\mathbf{k}) = A\\mathbf{x} + tA\\mathbf{k} = A\\mathbf{x}$. So every input on the line through $\\mathbf{x}$ parallel to the kernel lands on the same point. Move $t$, or drag $\\mathbf{x}$.',
    },
    {
      id: 'rank',
      title: 'Rank in space',
      caption:
        'In space the image can be all of space, a plane or a line, and the kernel the origin, a line or a plane. With rank $2$ the third column is the sum of the other two, so $(1, 1, -1)$ is in the kernel. Pick a rank and watch space collapse.',
    },
    {
      id: 'shadow',
      title: 'A shadow',
      caption:
        'Sunlight casting shadows on the ground is a linear map of space onto the floor, along the direction $\\mathbf{d}$ of the light. Every point on a ray of light has the same shadow, so the kernel is the line along $\\mathbf{d}$, and the image is the floor (rank $2$). Move along the ray, or drag the point.',
    },
    {
      id: 'features',
      title: 'Redundant features',
      caption:
        'A table whose third column is the sum of the first two (class hours, home hours, total hours) has $(1, 1, -1)$ in its kernel. Weights $\\mathbf{w}$ and $\\mathbf{w} + t(1, 1, -1)$ give the same predictions $X\\mathbf{w}$, so the data cannot tell them apart. Move $t$.',
    },
  ],
})
