import { ListChecks } from 'lucide-react'
import { use, useMemo, useState } from 'react'
import { catalog, getUnit, hasItems, type Item, type ProblemsModule, type Unit } from '@/catalog'
import { skillStatus, useProgress, type MixedPracticeState } from '@/progress'
import { Button } from '@/ui/atoms'
import { ToggleField } from '@/ui/molecules'
import { VizControls } from '@/viz-kit'
import { problemsOf, withSkillKeys } from './generators'
import { PracticeSession } from './PracticeSession'
import styles from './Practice.module.css'
import { msg } from '@/i18n'

const practiceItems = (unit: Unit) => unit.items.filter((i) => i.kind === 'practice')

/** Courses with the units that have practice items, in catalog order. */
const groups = catalog.areas.flatMap((area) =>
  area.courses.filter(hasItems).flatMap((course) => {
    const units = course.units.filter((u) => practiceItems(u).length > 0)
    return units.length ? [{ course, units }] : []
  }),
)

const loading = new Map<string, Promise<ProblemsModule[]>>()
const loadAll = (items: readonly Item[]) => {
  const key = items.map((i) => i.id).join('|')
  let p = loading.get(key)
  if (!p) loading.set(key, (p = Promise.all(items.map(problemsOf))))
  return p
}

/**
 * Practice across units: the learner picks units, and a session of eight problems draws from all
 * their practice items. Answers here do not count toward an item's progress; status suggestions at
 * the end work as in any practice session.
 */
export default function MixedPractice() {
  const hydrated = useProgress((s) => s.hydrated)
  const mixed = useProgress((s) => s.data.mixed)
  const [choosing, setChoosing] = useState<boolean>()
  if (!hydrated) return <div className={styles.scroll} />
  return (choosing ?? !mixed?.session) || !mixed ? (
    <MixedSetup initial={mixed} onStart={() => setChoosing(false)} />
  ) : (
    <>
      <MixedSession mixed={mixed} />
      <VizControls>
        <Button variant="ghost" icon={<ListChecks size={14} />} onClick={() => setChoosing(true)}>
          {msg.mixed.chooseUnits}
        </Button>
      </VizControls>
    </>
  )
}

function MixedSetup({
  initial,
  onStart,
}: {
  initial: MixedPracticeState | undefined
  onStart: () => void
}) {
  const data = useProgress((s) => s.data)
  const setMixed = useProgress((s) => s.setMixed)
  const [units, setUnits] = useState(
    () => new Set(initial?.units ?? groups.flatMap((g) => g.units.map((u) => u.id))),
  )
  const [skipMastered, setSkipMastered] = useState(initial?.skipMastered ?? true)

  const toggle = (id: string) =>
    setUnits((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const start = () => {
    setMixed({ units: [...units], skipMastered })
    onStart()
  }

  return (
    <div className={styles.scroll}>
      <div className={`${styles.column} ${styles.sheet}`}>
        <div>
          <h2 className={styles.sheetTitle}>{msg.mixed.title}</h2>
          <p className={styles.sheetIntro}>{msg.mixed.intro}</p>
        </div>
        <article className={styles.card}>
          {groups.map(({ course, units: list }) => (
            <fieldset key={course.id} className={styles.unitGroup}>
              <legend className={styles.panelTitle}>{course.title}</legend>
              {list.map((u) => {
                const mastered = u.skills.filter(
                  (s) => skillStatus(data, s.key) === 'mastered',
                ).length
                return (
                  <label key={u.id} className={styles.unitRow}>
                    <input
                      type="checkbox"
                      checked={units.has(u.id)}
                      onChange={() => toggle(u.id)}
                    />
                    <span>{u.title}</span>
                    <span className={styles.note}>
                      {msg.mixed.skillsMastered(mastered, u.skills.length)}
                    </span>
                  </label>
                )
              })}
            </fieldset>
          ))}
          <div className={styles.actions}>
            <ToggleField
              label={msg.mixed.skipMastered}
              checked={skipMastered}
              onChange={setSkipMastered}
            />
            <Button variant="primary" disabled={units.size === 0} onClick={start}>
              {msg.mixed.start}
            </Button>
          </div>
        </article>
      </div>
    </div>
  )
}

function MixedSession({ mixed }: { mixed: MixedPracticeState }) {
  const skills = useProgress((s) => s.data.skills)
  const setMixed = useProgress((s) => s.setMixed)
  const items = useMemo(
    () =>
      mixed.units.flatMap((id) => {
        const unit = getUnit(id)
        return unit ? practiceItems(unit) : []
      }),
    [mixed.units],
  )
  const modules = use(loadAll(items))
  const generators = useMemo(
    () => items.flatMap((item, k) => withSkillKeys(modules[k]!.problems, item, true)),
    [items, modules],
  )
  const pool = mixed.skipMastered
    ? generators.filter((g) => !g.skills.every((key) => skills[key]?.status === 'mastered'))
    : generators

  if (generators.length === 0 || (!mixed.session && pool.length === 0))
    return (
      <div className={styles.scroll}>
        <article className={`${styles.column} ${styles.card}`}>
          <p className={styles.sheetIntro}>
            {generators.length === 0 ? msg.mixed.noPractice : msg.mixed.allMastered}
          </p>
          {generators.length > 0 && (
            <div className={styles.actions}>
              <Button onClick={() => setMixed({ ...mixed, skipMastered: false })}>
                {msg.mixed.practiceAnyway}
              </Button>
            </div>
          )}
        </article>
      </div>
    )

  return (
    <PracticeSession
      generators={generators}
      pool={pool}
      stored={mixed.session}
      onSave={(session) => setMixed({ ...mixed, session })}
    />
  )
}
