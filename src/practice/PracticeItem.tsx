import { use } from 'react'
import { useCurrentItem, type Item, type ProblemsModule } from '@/catalog'
import { CheckpointSheet } from './CheckpointSheet'
import { PracticeSession } from './PracticeSession'

const loaded = new Map<string, Promise<ProblemsModule>>()

const problemsOf = (item: Item) => {
  let p = loaded.get(item.id)
  if (!p) {
    if (!item.loadProblems) throw new Error(`${item.id} has no problems`)
    loaded.set(item.id, (p = item.loadProblems()))
  }
  return p
}

/** Renders a practice or checkpoint item from its problem generators. */
export default function PracticeItem() {
  const item = useCurrentItem()
  const { problems } = use(problemsOf(item))
  return item.kind === 'checkpoint' ? (
    <CheckpointSheet item={item} generators={problems} />
  ) : (
    <PracticeSession item={item} generators={problems} />
  )
}
