import { defineArea } from '@/catalog/types'

/** Top-level areas, in the order they appear in the area switcher. */
export const areas = [
  defineArea({
    id: 'mathematics',
    title: 'Mathematics',
    description: 'From pre-calculus to calculus, linear algebra and probability.',
    icon: 'sigma',
  }),
  defineArea({
    id: 'data-engineering',
    title: 'Data Engineering',
    description: 'Relational thinking, storage, distributed processing and data architecture.',
    icon: 'database',
  }),
  defineArea({
    id: 'machine-learning',
    title: 'Machine Learning',
    description: 'Models that learn from data, starting with neural networks.',
    icon: 'network',
  }),
  defineArea({
    id: 'ai-engineering',
    title: 'AI Engineering',
    description: 'Systems built around models: retrieval, tools and pipelines.',
    icon: 'sparkles',
  }),
]
