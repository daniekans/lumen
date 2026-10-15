import { mulberry32, type Vec2 } from '@/lib/math'

export type Topic = 'account' | 'billing' | 'sync'

export interface Chunk {
  id: number
  topic: Topic
  text: string
  /** Position in a 2D projection of the embedding space, roughly in [-1, 1]. */
  pos: Vec2
}

/** Help-center articles for "Notewise", a fictional note-taking app, already split into chunks. */
const raw: { topic: Topic; text: string; pos: Vec2 }[] = [
  {
    topic: 'account',
    text: 'To reset your password, open Settings > Account and choose Reset password.',
    pos: [-0.42, 0.4],
  },
  {
    topic: 'account',
    text: 'The reset link is sent to your email and expires after 30 minutes.',
    pos: [-0.3, 0.55],
  },
  {
    topic: 'account',
    text: 'If you signed up with Google, sign in with Google instead of a password.',
    pos: [-0.7, 0.62],
  },
  {
    topic: 'account',
    text: 'Two-factor authentication can be turned on under Settings > Security.',
    pos: [-0.62, 0.22],
  },
  {
    topic: 'billing',
    text: 'The Pro plan costs $8 per month, billed monthly or yearly.',
    pos: [0.45, 0.62],
  },
  {
    topic: 'billing',
    text: 'Invoices for past payments are listed under Settings > Billing.',
    pos: [0.66, 0.4],
  },
  {
    topic: 'billing',
    text: 'After cancelling, Pro features stay active until the billing period ends.',
    pos: [0.52, 0.3],
  },
  {
    topic: 'sync',
    text: 'Notes sync across devices within a few seconds while you are online.',
    pos: [-0.1, -0.5],
  },
  {
    topic: 'sync',
    text: 'Offline edits are stored on the device and uploaded when you reconnect.',
    pos: [0.15, -0.7],
  },
  {
    topic: 'sync',
    text: 'When two edits conflict, both versions are kept and the newer one is marked.',
    pos: [0.22, -0.42],
  },
]

const rand = mulberry32(42)
const jitter = () => (rand() - 0.5) * 0.04

export const chunks: Chunk[] = raw.map((c, i) => ({
  ...c,
  id: i + 1,
  pos: [c.pos[0] + jitter(), c.pos[1] + jitter()],
}))

/** Where each topic's caption sits in the 2D view, beside its cluster. */
export const topicCenters: Record<Topic, Vec2> = {
  account: [-0.5, 0.02],
  billing: [0.56, 0.1],
  sync: [0.6, -0.58],
}

export const question = 'How do I reset my password?'
export const queryPos: Vec2 = [-0.38, 0.47]

export const distance = (a: Vec2, b: Vec2) => Math.hypot(a[0] - b[0], a[1] - b[1])

/** Chunks sorted by distance to the question, nearest first. */
export const ranked = chunks
  .map((c) => ({ chunk: c, distance: distance(c.pos, queryPos) }))
  .sort((a, b) => a.distance - b.distance)

export type Ranked = (typeof ranked)[number]

export const promptLines = (retrieved: readonly Ranked[]) => [
  'Answer the question using only the context below. Cite sources by number.',
  '',
  'Context:',
  ...retrieved.map((r, i) => `[${i + 1}] ${r.chunk.text}`),
  '',
  `Question: ${question}`,
]

/** The answer depends on what was retrieved: with k = 1 the expiry detail is not available. */
export const answerFor = (k: number) =>
  k >= 2
    ? 'Open Settings > Account and choose Reset password [1]. A reset link is emailed to you and expires after 30 minutes [2].'
    : 'Open Settings > Account and choose Reset password [1].'
