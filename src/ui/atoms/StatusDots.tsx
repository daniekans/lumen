import { SKILL_STATUSES, type SkillStatus } from '@/progress/types'

/** Three dots that fill as a skill moves from new to mastered. */
export function StatusDots({ status }: { status: SkillStatus }) {
  const level = SKILL_STATUSES.indexOf(status)
  return (
    <span aria-hidden style={{ display: 'inline-flex', gap: 3 }}>
      {[1, 2, 3].map((k) => (
        <span
          key={k}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            border: '1px solid var(--fg-muted)',
            background: k <= level ? 'var(--fg)' : 'transparent',
            borderColor: k <= level ? 'var(--fg)' : 'var(--fg-subtle)',
            transition: 'background-color var(--dur-base) var(--ease-out)',
          }}
        />
      ))}
    </span>
  )
}
