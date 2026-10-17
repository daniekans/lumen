import { Check } from 'lucide-react'
import { Link } from 'react-router'
import { getUnit, type Unit } from '@/catalog'
import { msg } from '@/i18n'
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
      eyebrow={msg.pages.unit.eyebrow}
      title={unit.title}
      description={unit.description}
      actions={
        unit.items.length > 0 && (
          <>
            <span className={styles.progress}>
              <ProgressRing value={summary.fraction} size={18} />
              {msg.progress.itemsDone(summary.itemsDone, summary.itemsTotal)}
            </span>
            <Tooltip
              content={known ? msg.pages.unit.unmarkKnownHint : msg.pages.unit.markKnownHint}
            >
              <Button onClick={() => setKnown(unit, !known)}>
                {known ? msg.pages.unit.unmarkKnown : msg.pages.unit.markKnown}
              </Button>
            </Tooltip>
          </>
        )
      }
    >
      {prerequisites.length > 0 && (
        <p className={styles.note}>
          {msg.pages.unit.recommendedFirst}{' '}
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

      <DocumentSection title={msg.pages.unit.items}>
        {unit.items.length === 0 ? (
          <p className={styles.note}>{msg.pages.unit.planned}</p>
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
                      {msg.catalog.kind[item.kind]}
                      <span className={styles.state}>
                        {info.state === 'done' ? (
                          <Check size={14} color="var(--viz-teal)" />
                        ) : (
                          <ProgressRing value={info.fraction} size={14} />
                        )}
                        {info.state === 'in-progress' ? msg.progress.inProgress : info.detail}
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
        <DocumentSection title={msg.pages.unit.skills}>
          <p className={styles.intro}>{msg.pages.unit.skillsIntro}</p>
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
