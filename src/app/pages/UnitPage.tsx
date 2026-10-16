import { Check } from 'lucide-react'
import { Link } from 'react-router'
import { getUnit, kindLabel, type Unit } from '@/catalog'
import { isUnitMarkedKnown, itemProgress, skillStatus, unitSummary, useProgress } from '@/progress'
import { Button, KindIcon, ProgressRing, Tooltip } from '@/ui/atoms'
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
  const setKnown = useProgress((s) => s.setUnitKnown)
  const known = unit.items.length > 0 && isUnitMarkedKnown(unit, data)
  const summary = unitSummary(unit, data)
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
        unit.items.length > 0 && (
          <>
            <span className={styles.progress}>
              <ProgressRing value={summary.fraction} size={18} />
              {summary.itemsDone} of {summary.itemsTotal} done
            </span>
            <Tooltip
              content={
                known
                  ? 'Removes the marks set by this button. Anything you actually completed stays done.'
                  : 'Marks everything in this unit as done and every skill as mastered. You can undo it.'
              }
            >
              <Button onClick={() => setKnown(unit, !known)}>
                {known ? 'Undo "I already know this unit"' : 'I already know this unit'}
              </Button>
            </Tooltip>
          </>
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

      <DocumentSection title="In this unit">
        {unit.items.length === 0 ? (
          <p className={styles.note}>This unit is planned. Its content has not been written yet.</p>
        ) : (
          <ol className={styles.list}>
            {unit.items.map((item) => {
              const info = itemProgress(item, data.items[item.id])
              return (
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
                      <span className={styles.state}>
                        {info.state === 'done' ? (
                          <Check size={14} color="var(--viz-teal)" />
                        ) : (
                          <ProgressRing value={info.fraction} size={14} />
                        )}
                        {info.state === 'in-progress' ? 'In progress' : info.detail}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
      </DocumentSection>

      {unit.skills.length > 0 && (
        <DocumentSection title="Skills">
          <p className={styles.intro}>
            What this unit teaches. Rate how well you know each skill, from new to mastered. This is
            your own assessment: it does not change the progress above, and you can change it at any
            time.
          </p>
          <ul className={styles.list}>
            {unit.skills.map((s) => (
              <li key={s.key} className={styles.row} style={{ gridTemplateColumns: '1fr auto' }}>
                <span className={styles.body}>
                  <span className={styles.title}>{s.title}</span>
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
        </DocumentSection>
      )}
    </DocumentLayout>
  )
}
