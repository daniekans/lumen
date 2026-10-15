import { BookOpen, Compass, Flag, PencilLine, type LucideProps } from 'lucide-react'
import { kindLabel, type ItemKind } from '@/catalog/types'

const icons = { explore: Compass, lesson: BookOpen, practice: PencilLine, checkpoint: Flag }

/** Icon for an item kind (explore, lesson, practice, checkpoint). */
export function KindIcon({ kind, ...props }: { kind: ItemKind } & LucideProps) {
  const Icon = icons[kind]
  return <Icon size={14} aria-label={kindLabel[kind]} {...props} />
}
