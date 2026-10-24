import clsx from 'clsx'
import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router'
import { getCourse, getUnit, type Item, type ItemKind, type Unit } from '@/catalog'
import { msg } from '@/i18n'
import {
  CHECKPOINT_PASS,
  isUnitMarkedKnown,
  itemProgress,
  nextItem,
  skillStatus,
  unitSummary,
  useProgress,
} from '@/progress'
import { Button, KindIcon, ProgressRing, RichText, Tex, Tooltip } from '@/ui/atoms'
import { Breadcrumbs, StatusPicker } from '@/ui/molecules'
import { TopBar } from '@/ui/organisms'
import { Term } from '@/ui/organisms/MdxWidgets'
import { DocumentLayout, DocumentSection } from '@/ui/templates'
import { crumbsFor } from '../crumbs'
import { usePageTitle } from '../usePageTitle'
import styles from './lists.module.css'
import page from './UnitPage.module.css'

/** Each kind of item gets its own badge, so practice and checkpoints stand out in the list. */
const kindClass: Record<ItemKind, string | undefined> = {
  explore: page.learn,
  lesson: page.learn,
  practice: page.practice,
  checkpoint: page.checkpoint,
}

/** A unit as a workspace: what to do next, its items in order, terms and skills. */
export function UnitPage({ unit }: { unit: Unit }) {
  usePageTitle(unit.title)
  const data = useProgress((s) => s.data)
  const setSkill = useProgress((s) => s.setSkillStatus)
  const clearSkill = useProgress((s) => s.clearSkillStatus)
  const setKnown = useProgress((s) => s.setUnitKnown)
  const known = unit.items.length > 0 && isUnitMarkedKnown(unit, data)
  const summary = unitSummary(unit, data)
  const prerequisites = (unit.prerequisites ?? []).map(getUnit).filter((u) => !!u)
  const course = getCourse(unit.courseId)
  const index = course ? course.units.indexOf(unit) : -1
  const next = nextItem(unit, data)

  const row = (item: Item) => {
    const info = itemProgress(item, data.items[item.id])
    const detail =
      item.kind === 'checkpoint' && info.state === 'not-started'
        ? msg.pages.unit.checkpointPasses(CHECKPOINT_PASS)
        : info.state === 'in-progress' && item.kind !== 'checkpoint'
          ? msg.progress.inProgress
          : info.detail
    return (
      <li key={item.id}>
        <Link
          to={item.path}
          className={clsx(styles.row, item.kind === 'checkpoint' && page.final)}
          onPointerEnter={() => void item.preload()}
        >
          <span className={clsx(page.badge, kindClass[item.kind])}>
            <KindIcon kind={item.kind} size={15} />
          </span>
          <span className={styles.body}>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.description}>
              <RichText>{item.summary}</RichText>
            </span>
          </span>
          <span className={styles.trail}>
            <span className={page.kind}>{msg.catalog.kind[item.kind]}</span>
            <span className={clsx(styles.state, item.kind === 'checkpoint' && page.score)}>
              {info.state === 'done' ? (
                <Check size={14} color="var(--viz-teal)" />
              ) : (
                <ProgressRing value={info.fraction} size={14} />
              )}
              {detail}
            </span>
          </span>
        </Link>
      </li>
    )
  }

  return (
    <DocumentLayout
      topBar={
        <TopBar>
          <Breadcrumbs items={crumbsFor(unit)} />
        </TopBar>
      }
      eyebrow={
        course && index >= 0
          ? msg.pages.unit.position(index + 1, course.units.length)
          : msg.pages.unit.eyebrow
      }
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
        <div className={page.prerequisites}>
          <span>{msg.pages.unit.recommendedFirst}</span>
          {prerequisites.map((p) => (
            <Link key={p.id} to={p.path} className={page.chip}>
              {p.title}
            </Link>
          ))}
        </div>
      )}

      {unit.items.length === 0 ? (
        <DocumentSection title={msg.pages.unit.items}>
          <p className={styles.note}>{msg.pages.unit.planned}</p>
        </DocumentSection>
      ) : next ? (
        <Link to={next.path} className={page.upNext} onPointerEnter={() => void next.preload()}>
          <span className={page.upNextIcon}>
            <KindIcon kind={next.kind} size={20} />
          </span>
          <span className={styles.body}>
            <span className={page.upNextLabel}>
              {msg.pages.unit.upNext} · {msg.catalog.kind[next.kind]}
            </span>
            <span className={styles.title}>{next.title}</span>
            <span className={styles.description}>
              <RichText>{next.summary}</RichText>
            </span>
          </span>
          <span className={page.go}>
            {itemProgress(next, data.items[next.id]).state === 'not-started'
              ? msg.pages.unit.start
              : msg.pages.unit.continue}
            <ArrowRight size={14} />
          </span>
        </Link>
      ) : (
        <p className={page.allDone}>
          <Check size={15} color="var(--viz-teal)" />
          {msg.pages.unit.allDone}
        </p>
      )}

      {unit.items.length > 0 && (
        <DocumentSection title={msg.pages.unit.items}>
          <ol className={styles.list}>{unit.items.map(row)}</ol>
        </DocumentSection>
      )}

      {unit.terms.length > 0 && (
        <DocumentSection title={msg.pages.unit.terms}>
          <p className={styles.intro}>{msg.pages.unit.termsIntro}</p>
          <div className={page.terms}>
            {unit.terms.map((t) => (
              <span key={t.id} className={page.term}>
                <Term id={t.id}>{t.title}</Term>
                {t.tex && <Tex>{t.tex}</Tex>}
              </span>
            ))}
          </div>
        </DocumentSection>
      )}

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
