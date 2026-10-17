import type { Item, ProblemsModule } from '@/catalog'
import type { ProblemGenerator } from '@/lib/practice'

const loaded = new Map<string, Promise<ProblemsModule>>()

/** The problem generators of a practice or checkpoint item, loaded once. */
export const problemsOf = (item: Item) => {
  let p = loaded.get(item.id)
  if (!p) {
    if (!item.loadProblems) throw new Error(`${item.id} has no problems`)
    loaded.set(item.id, (p = item.loadProblems()))
  }
  return p
}

/**
 * Generators as a session uses them: skills as global keys (`unit#skill`), so a session can mix
 * units. With `prefix`, ids also become unique across items.
 */
export const withSkillKeys = (
  generators: readonly ProblemGenerator[],
  item: Item,
  prefix = false,
): ProblemGenerator[] =>
  generators.map((g) => ({
    ...g,
    id: prefix ? `${item.id}:${g.id}` : g.id,
    skills: g.skills.map((s) => `${item.unitId}#${s}`),
  }))
