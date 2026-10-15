import { Check } from 'lucide-react'
import { Link } from 'react-router'
import { getUnit, kindLabel, type Unit } from '@/catalog'
import { isItemComplete, skillStatus, useProgress } from '@/progress'
import { Button, KindIcon } from '@/ui/atoms'
import { Breadcrumbs, StatusPicker } from '@/ui/molecules'
import { TopBar } from '@/ui/organisms'
import { DocumentLayout, DocumentSection } from '@/ui/templates'
import { crumbsFor } from '../crumbs'
import { usePageTitle } from '../usePageTitle'
import styles from './lists.module.css'

export function UnitPage({ unit }: { unit: Unit }) {
  usePageTitle(unit.title)
  const data = useProgress((s) => s.data)
  const setSkill = useProgress((s) => s.setSkillStatus)
  const clearSkill = useProgress((s) => s.clearSkillStatus)
  const setUnit = useProgress((s) => s.setUnitStatus)
  const allMastered =
    unit.skills.length > 0 && unit.skills.every((s) => skillStatus(data, s.key) === 'mastered')
  const prerequisites = (unit.prerequisites ?? []).map(getUnit).filter((u) => !!u)

  return (
    <DocumentLayout
      topBar={
        <TopBar>
          <Breadcrumbs items={crumbsFor(unit)} />
        </TopBar>
      }
      eyebrow="Unit"
      title={unit.title}
      description={unit.description}
      actions={
        unit.skills.length > 0 && (
          <Button onClick={() => setUnit(unit, allMastered ? 'new' : 'mastered')}>
            {allMastered ? 'Reset all skills to new' : 'I already know this unit'}
          </Button>
        )
      }
    >
      {prerequisites.length > 0 && (
        <p className={styles.note}>
          Recommended first:{' '}
          {prerequisites.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ', '}
              <Link to={p.path} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
                {p.title}
              </Link>
            </span>
          ))}
        </p>
      )}

      <DocumentSection title="Contents">
        {unit.items.length === 0 ? (
          <p className={styles.note}>This unit is planned. Its content has not been written yet.</p>
        ) : (
          <ol className={styles.list}>
            {unit.items.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={styles.row}
                  onPointerEnter={() => void item.preload()}
                >
                  <span className={styles.lead}>
                    <KindIcon kind={item.kind} size={16} />
                  </span>
                  <span className={styles.body}>
                    <span className={styles.title}>{item.title}</span>
                    <span className={styles.description}>{item.summary}</span>
                  </span>
                  <span className={styles.trail}>
                    {kindLabel[item.kind]}
                    {isItemComplete(item, data.items[item.id]) && (
                      <Check size={15} aria-label="Done" color="var(--fg)" />
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </DocumentSection>

      {unit.skills.length > 0 && (
        <DocumentSection title="Skills">
          <ul className={styles.list}>
            {unit.skills.map((s) => (
              <li key={s.key} className={styles.row} style={{ gridTemplateColumns: '1fr auto' }}>
                <span className={styles.body}>
                  <span className={styles.title}>{s.title}</span>
                  {data.skills[s.key]?.source === 'manual' && (
                    <span className={styles.description}>set by you</span>
                  )}
                </span>
                <StatusPicker
                  label={s.title}
                  status={skillStatus(data, s.key)}
                  manual={data.skills[s.key]?.source === 'manual'}
                  onChange={(status) => setSkill(s.key, status)}
                  onClear={() => clearSkill(s.key)}
                />
              </li>
            ))}
          </ul>
          <p className={styles.note}>
            Statuses describe where you stand, and you can set them in either direction at any time.
            When practice suggests a status, your own choice still wins.
          </p>
        </DocumentSection>
      )}
    </DocumentLayout>
  )
}
