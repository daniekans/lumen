import type { ItemKind, ItemLevel } from '@/catalog/types'
import type { SkillStatus } from '@/progress/types'
import { formatInteger as n, formatPercent, plural } from './format'

/**
 * Every UI string, grouped by the layer that shows it. Plain strings for fixed copy, functions for
 * copy with values in it. A translation is another object of the type `Messages`.
 */
export const en = {
  app: {
    name: 'Lumen',
    pageTitle: (page: string) => `${page} · Lumen`,
  },

  catalog: {
    kind: {
      explore: 'Exploration',
      lesson: 'Lesson',
      practice: 'Practice',
      checkpoint: 'Checkpoint',
    } satisfies Record<ItemKind, string>,
    level: { intro: 'intro', core: 'core', advanced: 'advanced' } satisfies Record<
      ItemLevel,
      string
    >,
    nodeType: { area: 'area', course: 'course', unit: 'unit', item: 'item' },
  },

  progress: {
    skillStatus: {
      new: 'New',
      practiced: 'Practiced',
      proficient: 'Proficient',
      mastered: 'Mastered',
    } satisfies Record<SkillStatus, string>,
    done: 'Done',
    notStarted: 'Not started',
    inProgress: 'In progress',
    /** Detail of an item in progress, from parts such as `stepsOf`. */
    inProgressDetail: (parts: readonly string[]) => `In progress: ${parts.join(', ')}`,
    stepsOf: (visited: number, total: number) =>
      `${n(visited)} of ${n(total)} ${plural(total, { one: 'step', other: 'steps' })}`,
    questionsOf: (correct: number, total: number) =>
      `${n(correct)} of ${n(total)} ${plural(total, { one: 'question', other: 'questions' })}`,
    correctAnswersOf: (correct: number, goal: number) =>
      `${n(correct)} of ${n(goal)} correct ${plural(goal, { one: 'answer', other: 'answers' })}`,
    bestScore: (best: number, pass: number) =>
      `Best score ${formatPercent(best)}, ${formatPercent(pass)} passes`,
    importError: {
      notProgress: 'This file does not contain Lumen progress data.',
      newerVersion: 'This progress file comes from a newer version of Lumen.',
    },
  },
}

export type Messages = typeof en
