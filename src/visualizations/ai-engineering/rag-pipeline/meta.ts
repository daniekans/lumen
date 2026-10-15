import { defineViz } from '@/content/types'

export const meta = defineViz({
  title: 'Retrieval-augmented generation',
  summary:
    'How a RAG system answers a question from its own documents: chunk, embed, retrieve the nearest chunks, then generate from them.',
  tags: ['rag', 'retrieval', 'embeddings', 'vector store', 'llm', 'prompt', 'top-k'],
  level: 'intro',
  order: 1,
  steps: [
    {
      id: 'indexing',
      title: 'Split the documents',
      caption:
        'The source documents are cut into short chunks. Each chunk should make sense on its own, because it will be retrieved and read alone.',
    },
    {
      id: 'embedding',
      title: 'Embed and store',
      caption:
        'An embedding model turns every chunk into a vector. Chunks about the same topic land close together. The vectors go into a vector store with their text.',
    },
    {
      id: 'query',
      title: 'Embed the question',
      caption:
        'At query time the same model embeds the question, placing it in the same space as the chunks.',
    },
    {
      id: 'retrieval',
      title: 'Retrieve the nearest chunks',
      caption:
        'The vector store returns the $k$ chunks closest to the question vector. Change $k$ and watch the search radius grow.',
    },
    {
      id: 'prompt',
      title: 'Assemble the prompt',
      caption:
        'The retrieved chunks are numbered and placed in the prompt as context, followed by the question.',
    },
    {
      id: 'generation',
      title: 'Generate the answer',
      caption:
        'The language model writes an answer from the context it was given and cites the chunks it used.',
    },
  ],
})
