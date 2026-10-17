import { describe, expect, it } from 'vitest'
import { buildCatalog, type CatalogSources } from './build'
import type { ItemMeta, LazyComponent } from './types'

const load = async () => ({ default: () => null })
const item = (title: string, order: number, extra: Partial<ItemMeta> = {}): ItemMeta => ({
  title,
  summary: '',
  tags: [],
  level: 'intro',
  order,
  ...extra,
})

const sources = (overrides: Partial<CatalogSources> = {}): CatalogSources => ({
  areas: [
    { id: 'math', title: 'Math', description: '', icon: 'sigma' },
    { id: 'data', title: 'Data', description: '', icon: 'database' },
  ],
  courses: {
    '../content/math/calc/course.ts': { title: 'Calc', description: '', order: 1 },
  },
  units: {
    '../content/math/calc/limits/unit.ts': {
      title: 'Limits',
      description: '',
      order: 2,
      skills: [{ id: 'intuition', title: 'Intuition' }],
    },
    '../content/math/calc/derivatives/unit.ts': { title: 'Derivatives', description: '', order: 3 },
  },
  items: {
    '../content/math/calc/limits/b/meta.ts': item('B', 2),
    '../content/math/calc/limits/a/meta.ts': item('A', 1, { skills: ['intuition'] }),
  },
  components: {
    '../content/math/calc/limits/a/index.tsx': load,
    '../content/math/calc/limits/b/index.tsx': load,
  },
  explanations: { '../content/math/calc/limits/a/explanation.mdx': load },
  lazy: (l) => l as unknown as LazyComponent,
  includeDrafts: false,
  ...overrides,
})

describe('buildCatalog', () => {
  it('derives ids, paths and parents from folders, sorted by order', () => {
    const c = buildCatalog(sources())
    const units = c.areas[0]!.courses[0]!.units
    expect(units.map((u) => u.id)).toEqual(['math/calc/limits', 'math/calc/derivatives'])
    const items = units[0]!.items
    expect(items.map((i) => i.id)).toEqual(['math/calc/limits/a', 'math/calc/limits/b'])
    expect(items[0]).toMatchObject({
      path: '/math/calc/limits/a',
      kind: 'explore',
      unitId: 'math/calc/limits',
      courseId: 'math/calc',
      areaId: 'math',
      skillKeys: ['math/calc/limits#intuition'],
    })
    expect(items[0]!.Explanation).toBeDefined()
    expect(items[1]!.Explanation).toBeUndefined()
    expect(c.items).toHaveLength(2)
    expect(c.byId.get('math/calc')?.type).toBe('course')
    expect(c.areas[1]!.courses).toEqual([])
  })

  it('reports and skips broken entries', () => {
    const problems: string[] = []
    const c = buildCatalog(
      sources({
        items: {
          ...sources().items,
          '../content/math/calc/limits/c/meta.ts': item('C', 3),
          '../content/math/calc/limits/d/meta.ts': item('D', 4, { skills: ['missing'] }),
          '../content/math/calc/nowhere/e/meta.ts': item('E', 1),
        },
        components: {
          ...sources().components,
          '../content/math/calc/limits/d/index.tsx': load,
          '../content/math/calc/nowhere/e/index.tsx': load,
        },
        onProblem: (m) => problems.push(m),
      }),
    )
    expect(c.items.map((i) => i.slug)).toEqual(['a', 'b', 'd'])
    expect(problems.join('\n')).toMatch(/limits\/c has no index\.tsx/)
    expect(problems.join('\n')).toMatch(/unknown skill "missing"/)
    expect(problems.join('\n')).toMatch(/nowhere have no unit\.ts/)
  })

  it('hides drafts unless asked to include them', () => {
    const drafts = {
      items: {
        ...sources().items,
        '../content/math/calc/limits/b/meta.ts': item('B', 2, { status: 'draft' }),
      },
    }
    expect(buildCatalog(sources(drafts)).items).toHaveLength(1)
    expect(buildCatalog(sources({ ...drafts, includeDrafts: true })).items).toHaveLength(2)
  })

  describe('terms', () => {
    const limits = sources().units['../content/math/calc/limits/unit.ts']!
    const withTerms = (overrides: Partial<CatalogSources> = {}) =>
      sources({
        units: {
          ...sources().units,
          '../content/math/calc/limits/unit.ts': {
            ...limits,
            terms: [
              { id: 'limit', title: 'Limit', tex: '\\lim', summary: '', introducedIn: 'a' },
              { id: 'epsilon', title: 'Epsilon', summary: '', introducedIn: 'b' },
            ],
          },
        },
        ...overrides,
      })

    it('resolves terms and records uses in reading order', () => {
      const c = buildCatalog(
        withTerms({ termUses: { 'math/calc/limits/b': ['limit'], 'math/calc/limits/a': ['limit'] } }),
      )
      expect(c.terms.map((t) => t.id)).toEqual(['epsilon', 'limit'])
      expect(c.termsById.get('limit')).toMatchObject({
        path: '/glossary#limit',
        unitId: 'math/calc/limits',
        introducedIn: 'math/calc/limits/a',
        usedIn: ['math/calc/limits/b'],
      })
      expect(c.areas[0]!.courses[0]!.units[0]!.terms).toHaveLength(2)
    })

    it('reports duplicates, unknown items and unknown links', () => {
      const problems: string[] = []
      buildCatalog(
        withTerms({
          units: {
            ...withTerms().units,
            '../content/math/calc/derivatives/unit.ts': {
              title: 'Derivatives',
              description: '',
              order: 3,
              terms: [
                { id: 'limit', title: 'Limit again', summary: '', introducedIn: 'a' },
                { id: 'slope', title: 'Slope', summary: '', introducedIn: 'missing' },
              ],
            },
          },
          termUses: { 'math/calc/limits/a': ['nope'] },
          onProblem: (m) => problems.push(m),
        }),
      )
      expect(problems.join('\n')).toMatch(/"limit" in math\/calc\/derivatives is already declared/)
      expect(problems.join('\n')).toMatch(/unknown item "missing"/)
      expect(problems.join('\n')).toMatch(/links unknown term "nope"/)
    })

    it('drops terms introduced by hidden drafts without a problem', () => {
      const problems: string[] = []
      const c = buildCatalog(
        withTerms({
          items: {
            ...sources().items,
            '../content/math/calc/limits/b/meta.ts': item('B', 2, { status: 'draft' }),
          },
          termUses: { 'math/calc/limits/a': ['epsilon'] },
          onProblem: (m) => problems.push(m),
        }),
      )
      expect(c.terms.map((t) => t.id)).toEqual(['limit'])
      expect(problems).toEqual([])
    })
  })
})
