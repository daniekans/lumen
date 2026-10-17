import type { ItemKind, ItemLevel } from '@/catalog/types'
import type { SkillStatus } from '@/progress/types'
import { formatDateTime, formatInteger as n, formatPercent, plural } from './format'

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
    itemsDone: (done: number, total: number) => `${n(done)} of ${n(total)} done`,
    itemsDoneInUnit: (done: number, total: number) => `${n(done)} of ${n(total)} done in this unit`,
    units: (count: number) => `${n(count)} ${plural(count, { one: 'unit', other: 'units' })}`,
  },

  /** Words shared by several components. */
  common: {
    planned: 'planned',
    check: 'Check',
    clear: 'Clear',
    cancel: 'Cancel',
    close: 'Close',
    search: 'Search',
    loading: 'Loading…',
    yourAnswer: 'Your answer',
    correct: 'Correct.',
    notQuite: 'Not quite.',
    answer: 'Answer:',
    solution: 'Solution',
    next: (title: string) => `Next: ${title}`,
  },

  keys: { search: 'Ctrl K', escape: 'Esc' },

  shell: {
    hideSidebar: 'Hide sidebar',
    showSidebar: 'Show sidebar',
    areas: 'Areas',
    areaOverview: 'Overview',
    areaContents: (area: string) => `${area} contents`,
    areaEmpty: 'Nothing here yet. Content for this area is on the way.',
    expand: (title: string) => `Expand ${title}`,
    collapse: (title: string) => `Collapse ${title}`,
    lightTheme: 'Light theme',
    darkTheme: 'Dark theme',
    breadcrumb: 'Breadcrumb',
    vizControls: 'Visualization controls',
    progressRing: (fraction: number) => formatPercent(fraction),
  },

  palette: {
    title: 'Search visualizations',
    placeholder: 'Search courses, units and topics',
    noMatches: (query: string) => `No matches for “${query}”.`,
  },

  errors: {
    staleTitle: 'This page was updated since it was opened.',
    failedTitle: 'This part of the page failed to load.',
    staleHint: 'Reload to get the current version.',
    reload: 'Reload',
  },

  item: {
    explanation: 'Explanation',
    resizeExplanation: 'Resize explanation',
    dock: 'Dock to the side',
    float: 'Float over the stage',
    setByYou: 'set by you',
    steps: 'Steps',
    previousStep: 'Previous step',
    nextStep: 'Next step',
    markDone: 'Mark as done',
    doneHint: 'Visiting every step and answering every question does this for you',
    undoneHint: 'Click to mark as not done and clear its progress',
    resetProgress: 'Reset progress',
    answered: 'Answered',
    clearChoiceHint: 'Click your answer again to clear it.',
    tryAgain: 'Try again.',
    showExplanation: 'Show explanation',
    hideExplanation: 'Hide explanation',
  },

  skills: {
    resetToNew: 'Reset to new',
    /** Accessible name of a status picker: the skill and its status. */
    picker: (skill: string, status: string) => `${skill}: ${status}`,
  },

  mathInput: {
    loading: 'Loading the math input…',
    keyboard: 'Math keyboard',
  },

  settings: {
    title: 'Progress and backup',
    howItWorks: 'How progress works',
    terms: [
      {
        term: 'Units',
        text: 'Each course is split into units. A unit holds explorations (interactive visuals with steps) and lessons (the same, plus questions).',
      },
      {
        term: 'Done',
        text: 'An exploration is done once you have visited all its steps; a lesson also needs every question answered correctly. You can mark anything done or not done yourself.',
      },
      {
        term: 'Progress rings',
        text: 'How much of a unit is done. An empty ring means not started.',
      },
      {
        term: 'Skills',
        text: 'What a unit teaches, rated by you from new to mastered. Ratings never change the rings.',
      },
    ],
    backup: 'Backup',
    backupStatus: (items: number, skills: number, lastExport: string | undefined) =>
      `Progress is stored in this browser only: ${n(items)} visited ${plural(items, { one: 'item', other: 'items' })}, ${n(skills)} ${plural(skills, { one: 'skill status', other: 'skill statuses' })}. Export a file to keep a copy or to move to another browser. Last export: ${lastExport ? formatDateTime(lastExport) : 'never'}.`,
    export: 'Export',
    import: 'Import',
    exported: 'Progress exported.',
    imported: (file: string) => `Imported progress from ${file}.`,
    unreadableFile: 'Could not read that file.',
    storageProblem: (detail: string) => `Storage problem: ${detail}`,
    reset: 'Reset',
    resetHint: 'Clears all progress in this browser. Exported files are not affected.',
    cleared: 'Progress cleared.',
    clearAll: 'Clear all progress',
    resetProgress: 'Reset progress',
  },
}

export type Messages = typeof en
