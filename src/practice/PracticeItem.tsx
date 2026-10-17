import { use, useMemo } from 'react'
import { neighbours, useCurrentItem } from '@/catalog'
import { useProgress } from '@/progress'
import { CheckpointSheet } from './CheckpointSheet'
import { problemsOf, withSkillKeys } from './generators'
import { PracticeSession } from './PracticeSession'

/** Renders a practice or checkpoint item from its problem generators. */
export default function PracticeItem() {
  const item = useCurrentItem()
  const { problems } = use(problemsOf(item))
  const stored = useProgress((s) => s.data.items[item.id]?.session)
  const setSession = useProgress((s) => s.setSession)
  const recordPractice = useProgress((s) => s.recordPractice)
  const generators = useMemo(() => withSkillKeys(problems, item), [problems, item])
  if (item.kind === 'checkpoint') return <CheckpointSheet item={item} generators={problems} />
  return (
    <PracticeSession
      generators={generators}
      stored={stored}
      onSave={(session) => setSession(item.id, session)}
      onAnswer={(correct) => recordPractice(item.id, correct)}
      next={neighbours(item).next}
    />
  )
}
