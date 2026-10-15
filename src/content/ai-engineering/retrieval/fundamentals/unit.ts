import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Fundamentals',
  description: 'Chunking, embeddings, vector search and prompt assembly.',
  order: 1,
  skills: [{ id: 'rag-pipeline', title: 'The stages of a RAG pipeline' }],
})
