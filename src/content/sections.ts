export const sections = [
  {
    id: 'calculus',
    title: 'Calculus',
    description: 'Limits, derivatives and integrals as pictures of change and accumulation.',
  },
  {
    id: 'linear-algebra',
    title: 'Linear Algebra',
    description: 'Vectors, matrices and the transformations they describe.',
  },
  {
    id: 'complex-numbers',
    title: 'Complex Numbers',
    description: 'Arithmetic on the plane: rotation, scaling and beyond.',
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks',
    description: 'How layered functions compute, and how they learn from error.',
  },
  {
    id: 'ai-engineering',
    title: 'AI Engineering',
    description: 'Systems built around models: retrieval, tools and pipelines.',
  },
] as const

export type SectionId = (typeof sections)[number]['id']
export type Section = (typeof sections)[number]

export const isSectionId = (id: string): id is SectionId => sections.some((s) => s.id === id)
