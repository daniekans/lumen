import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Fundamentals',
  description: 'Chunking, embeddings, vector search and prompt assembly.',
  order: 1,
  skills: [{ id: 'rag-pipeline', title: 'The stages of a RAG pipeline' }],
  terms: [
    {
      id: 'rag',
      title: 'Retrieval-augmented generation (RAG)',
      summary:
        "Putting the relevant passages of your own documents into a language model's prompt at question time, so it can answer from them.",
      introducedIn: 'rag-pipeline',
    },
    {
      id: 'chunking',
      title: 'Chunking',
      summary:
        "Splitting documents into passages of a few sentences, often overlapping. Too long dilutes a chunk's meaning; too short loses context.",
      introducedIn: 'rag-pipeline',
    },
    {
      id: 'embedding',
      title: 'Embedding',
      tex: '\\mathbf{v} \\in \\mathbb{R}^d',
      summary:
        'A vector that a model assigns to a text so that similar meanings land close together. Questions and chunks must use the same model.',
      introducedIn: 'rag-pipeline',
    },
    {
      id: 'vector-store',
      title: 'Vector store',
      summary:
        'A database of embeddings that returns the $k$ vectors most similar to a query vector.',
      introducedIn: 'rag-pipeline',
    },
    {
      id: 'cosine-similarity',
      title: 'Cosine similarity',
      tex: '\\frac{\\mathbf{q} \\cdot \\mathbf{v}}{\\lVert \\mathbf{q} \\rVert \\, \\lVert \\mathbf{v} \\rVert}',
      summary:
        'The cosine of the angle between two vectors. For normalized vectors it ranks results in the same order as Euclidean distance.',
      introducedIn: 'rag-pipeline',
    },
    {
      id: 'ann-index',
      title: 'Approximate nearest-neighbour index',
      summary:
        'An index such as HNSW that finds vectors close to a query without comparing against every vector, trading a little recall for speed.',
      introducedIn: 'rag-pipeline',
    },
  ],
})
