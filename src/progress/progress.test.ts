import { describe, expect, it } from 'vitest'
import type { Item, Unit } from '@/catalog/types'
import { isItemComplete, itemProgress, nextItem, nextUnit, unitSummary } from './derive'
import { emptyProgress, migrate } from './schema'
import type { ItemProgress } from './types'

const steps = [
  { id: 's1', title: '', caption: '' },
  {
    id: 's2',
    title: '',
    caption: '',
    check: { kind: 'choice', prompt: '', options: ['a', 'b'], answer: 1 },
  },
] as const

const makeItem = (kind: Item['kind']): Item =>
  ({ id: 'u/i', kind, steps, skillKeys: [] }) as unknown as Item

const progress = (p: Partial<ItemProgress>): ItemProgress => ({
  visitedSteps: [],
  correctChecks: [],
  lastVisitedAt: '',
  ...p,
})

describe('isItemComplete', () => {
  it('explore items complete when every step was visited', () => {
    const item = makeItem('explore')
    expect(isItemComplete(item, undefined)).toBe(false)
    expect(isItemComplete(item, progress({ visitedSteps: ['s1'] }))).toBe(false)
    expect(isItemComplete(item, progress({ visitedSteps: ['s1', 's2'] }))).toBe(true)
  })

  it('lessons also need every check answered correctly', () => {
    const item = makeItem('lesson')
    expect(isItemComplete(item, progress({ visitedSteps: ['s1', 's2'] }))).toBe(false)
    expect(
      isItemComplete(item, progress({ visitedSteps: ['s1', 's2'], correctChecks: ['s2'] })),
    ).toBe(true)
  })

  it('a manual override wins in both directions', () => {
    const item = makeItem('explore')
    expect(isItemComplete(item, progress({ manual: 'done' }))).toBe(true)
    expect(isItemComplete(item, progress({ visitedSteps: ['s1', 's2'], manual: 'not-done' }))).toBe(
      false,
    )
  })
})

describe('itemProgress', () => {
  it('reports not started, in progress with detail, and done', () => {
    const item = makeItem('lesson')
    expect(itemProgress(item, undefined).state).toBe('not-started')
    const mid = itemProgress(item, progress({ visitedSteps: ['s1'] }))
    expect(mid.state).toBe('in-progress')
    expect(mid.detail).toBe('In progress: 1 of 2 steps, 0 of 1 question')
    expect(mid.fraction).toBeCloseTo(1 / 3)
    expect(
      itemProgress(item, progress({ visitedSteps: ['s1', 's2'], correctChecks: ['s2'] })).state,
    ).toBe('done')
  })
})

describe('unitSummary', () => {
  it('counts items for progress and skills separately', () => {
    const unit = {
      items: [makeItem('explore')],
      skills: [
        { key: 'u#a', id: 'a', title: '', unitId: 'u' },
        { key: 'u#b', id: 'b', title: '', unitId: 'u' },
      ],
    } as unknown as Unit
    const data = emptyProgress()
    expect(unitSummary(unit, data).fraction).toBe(0)
    data.items['u/i'] = progress({ manual: 'done' })
    data.skills['u#a'] = { status: 'mastered', source: 'manual', updatedAt: '' }
    const s = unitSummary(unit, data)
    expect(s.itemsDone).toBe(1)
    expect(s.skills).toEqual({ new: 1, practiced: 0, proficient: 0, mastered: 1 })
    expect(s.fraction).toBe(1)
  })
})

describe('nextItem and nextUnit', () => {
  it('pick the first item that is not done, and skip finished or empty units', () => {
    const a = { ...makeItem('explore'), id: 'u1/a' } as Item
    const b = { ...makeItem('practice'), id: 'u1/b' } as Item
    const c = { ...makeItem('explore'), id: 'u2/c' } as Item
    const u1 = { id: 'u1', items: [a, b] } as unknown as Unit
    const empty = { id: 'e', items: [] } as unknown as Unit
    const u2 = { id: 'u2', items: [c] } as unknown as Unit
    const data = emptyProgress()
    expect(nextItem(u1, data)).toBe(a)
    expect(nextUnit([empty, u1, u2], data)).toBe(u1)
    data.items['u1/a'] = progress({ manual: 'done' })
    expect(nextItem(u1, data)).toBe(b)
    data.items['u1/b'] = progress({ manual: 'done' })
    expect(nextItem(u1, data)).toBeUndefined()
    expect(nextUnit([empty, u1, u2], data)).toBe(u2)
  })
})

describe('migrate', () => {
  it('returns empty progress for nothing stored', () => {
    expect(migrate(undefined)).toEqual(emptyProgress())
  })

  it('keeps valid entries and drops malformed ones', () => {
    const data = migrate({
      version: 1,
      skills: {
        ok: { status: 'proficient', source: 'manual', updatedAt: 'x' },
        bad: { status: 'genius' },
      },
      items: {
        i: { visitedSteps: ['s1', 3], correctChecks: [], lastVisitedAt: 'y', manual: 'done' },
        j: 5,
      },
      lastItemId: 'i',
    })
    expect(Object.keys(data.skills)).toEqual(['ok'])
    expect(data.items.i).toEqual({
      visitedSteps: ['s1'],
      correctChecks: [],
      lastVisitedAt: 'y',
      manual: 'done',
    })
    expect(data.items.j).toBeUndefined()
    expect(data.lastItemId).toBe('i')
  })

  it('keeps a valid mixed practice scope and drops a malformed one', () => {
    const mixed = { units: ['a/b/c'], skipMastered: true }
    expect(migrate({ version: 1, mixed }).mixed).toEqual(mixed)
    expect(migrate({ version: 1, mixed: { units: [1], skipMastered: true } }).mixed).toBeUndefined()
  })

  it('rejects files that are not progress data or come from a newer version', () => {
    expect(() => migrate({ hello: 'world' })).toThrow(/does not contain/)
    expect(() => migrate({ version: 99 })).toThrow(/newer version/)
  })
})

describe('resetItem', () => {
  it('returns a done item to not started and keeps unfinished work and skills', async () => {
    const { useProgress } = await import('./useProgress')
    const item = makeItem('lesson')
    const session = { entries: [], difficulty: 'auto' as const, finished: false }
    useProgress.setState({
      data: {
        ...emptyProgress(),
        skills: { 'u#a': { status: 'mastered', source: 'manual', updatedAt: '' } },
        items: {
          'u/i': progress({
            visitedSteps: ['s1', 's2'],
            correctChecks: ['s2'],
            manual: 'done',
            practice: { attempts: 3, correct: 2 },
            session,
          }),
        },
      },
    })
    useProgress.getState().resetItem('u/i')
    const { data } = useProgress.getState()
    const p = data.items['u/i']
    expect(itemProgress(item, p).state).toBe('not-started')
    expect(p).toMatchObject({ visitedSteps: [], correctChecks: [], session })
    expect(p?.manual).toBeUndefined()
    expect(p?.practice).toBeUndefined()
    expect(data.skills['u#a']?.status).toBe('mastered')
  })
})

describe('migrate with moved content', () => {
  const moves: Record<string, string> = { 'old-unit': 'area/course/unit', 'a/x': 'a/y' }
  const rename = (id: string) => {
    const prefix = Object.keys(moves).find((m) => id === m || id.startsWith(`${m}/`))
    return prefix ? moves[prefix] + id.slice(prefix.length) : id
  }

  it('moves item and skill entries to their new ids', () => {
    const data = migrate(
      {
        version: 1,
        items: { 'old-unit/item': { visitedSteps: ['s'], correctChecks: [], manual: 'done' } },
        skills: { 'old-unit#skill': { status: 'mastered', source: 'manual', updatedAt: 'x' } },
      },
      rename,
    )
    expect(data.items['area/course/unit/item']?.manual).toBe('done')
    expect(data.items['old-unit/item']).toBeUndefined()
    expect(data.skills['area/course/unit#skill']?.status).toBe('mastered')
  })

  it('keeps the newer entry when old and new ids both exist', () => {
    const data = migrate(
      {
        version: 1,
        items: {
          'a/y': { visitedSteps: ['new'], correctChecks: [], lastVisitedAt: '2026-02-01' },
          'a/x': { visitedSteps: ['old'], correctChecks: [], lastVisitedAt: '2026-01-01' },
        },
      },
      rename,
    )
    expect(data.items['a/y']?.visitedSteps).toEqual(['new'])
  })
})
