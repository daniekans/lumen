import type { ItemKind, ItemLevel } from '@/catalog/types'
import type { CheckIssue } from '@/lib/practice/answers'
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
    nodeType: { area: 'area', course: 'course', unit: 'unit', item: 'item', term: 'term' },
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
    paperTheme: 'Paper theme',
    breadcrumb: 'Breadcrumb',
    vizControls: 'Visualization controls',
    progressRing: (fraction: number) => formatPercent(fraction),
  },

  palette: {
    title: 'Search visualizations',
    placeholder: 'Search courses, units, topics and terms',
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
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    stepOf: (index: number, count: number) => `${n(index)} / ${n(count)}`,
  },

  viz: {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetView: 'Reset view (or double-click the background)',
    expandPanel: 'Open larger',
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

  practice: {
    difficulty: 'Difficulty',
    level: { auto: 'Auto', 1: 'Easy', 2: 'Medium', 3: 'Hard' },
    review: 'Review',
    couldNotCheck: 'Could not check that.',
    retryHint: 'Try again, open a hint, or see the solution.',
    issue: (issue: CheckIssue): string => {
      switch (issue.kind) {
        case 'unreadable':
          return 'That could not be read as math. Check for unbalanced brackets or empty boxes.'
        case 'not-a-number':
          return 'The answer should be a number, without variables.'
        case 'undefined-value':
          return 'That value is undefined.'
        case 'list-format':
          return 'Write the numbers separated by commas.'
        case 'more-to-find':
          return `There ${plural(issue.remaining, { one: 'is', other: 'are' })} more to find.`
        case 'unknown-variable':
          return `Use only ${issue.allowed.join(', ') || 'numbers'} in your answer.`
        case 'no-answer':
          return 'No answer.'
      }
    },
    placeholder: {
      number: 'A number, like $\\frac{3}{4}$ or $\\sqrt{2}$',
      expression: 'An expression',
      list: 'Numbers separated by commas',
    },
    selfGraded: 'Work this out on paper, then compare with the solution and grade yourself.',
    howDidItGo: 'How did it go?',
    gotItRight: 'I got it right',
    gotItWrong: 'I got it wrong',
    markedRight: 'Marked as right.',
    markedWrong: 'Marked as wrong.',
    hint: 'Hint',
    anotherHint: 'Another hint',
    hints: 'Hints',
    showSolution: 'Show the solution',
    showWorkedSolution: 'Show the worked solution',
    /** Accessible name of a progress dot. */
    problemDot: (index: number, outcome?: boolean) =>
      `Problem ${n(index)}${outcome === undefined ? '' : outcome ? ', right' : ', wrong'}`,
    next: 'Next',
    backToSummary: 'Back to the summary',
    backToCurrent: 'Back to the current problem',
    seeResults: 'See results',
    nextProblem: 'Next problem',
    skip: 'Skip',
    differentProblem: 'Different problem',
    startOver: 'Start over',
    score: (correct: number, total: number) => `${n(correct)} of ${n(total)} correct`,
    scoreNote:
      'First answers count. Retries, hints and solutions help you learn but do not raise the score.',
    suggests: (status: string) => ` · this session suggests ${status.toLowerCase()}`,
    setTo: (status: string) => `Set to ${status}`,
    practiceAgain: 'Practice again',
    reviewAnswers: 'Review answers',
  },

  checkpoint: {
    intro: (count: number, pass: number) =>
      `${n(count)} ${plural(count, { one: 'problem', other: 'problems' })}. Work them out on paper, enter your answers, then check them all. ${formatPercent(pass)} passes.`,
    print: 'Print',
    newSet: 'New set',
    score: (correct: number, total: number) =>
      `${n(correct)} of ${n(total)} (${formatPercent(correct / total)})`,
    passed: 'Passed. The unit checkpoint is done.',
    notPassed:
      'Not passed yet. Review the solutions below, then draw a new set when you are ready.',
    problem: (index: number) => `Problem ${n(index)}`,
    answerTo: (index: number) => `Answer to problem ${n(index)}`,
    selfGrade: 'Compare with the solution below. Did you get it?',
    yes: 'Yes',
    no: 'No',
    fixInvalid: (count: number) =>
      `Fix the ${plural(count, { one: 'answer', other: 'answers' })} that could not be read, then check again.`,
    gradeSelfChecked: 'Grade the self-checked problems to see your score.',
    unansweredCount: 'Unanswered problems count as incorrect.',
    checkAnswers: 'Check answers',
    checkAgain: 'Check again',
  },

  glossary: {
    title: 'Notation and glossary',
    link: 'Glossary',
    description:
      'Every symbol and term the lessons define, with the item that introduces it and the items that use it.',
    filter: 'Filter terms',
    count: (count: number) => `${n(count)} ${plural(count, { one: 'term', other: 'terms' })}`,
    noMatches: (query: string) => `No terms match “${query}”.`,
    introducedIn: 'Introduced in',
    usedIn: 'Used in',
    openEntry: 'Open in glossary',
  },

  mixed: {
    title: 'Mixed practice',
    intro:
      'Eight problems drawn from the practice items of the units you choose. Answers here do not change item progress.',
    skillsMastered: (mastered: number, total: number) =>
      `${n(mastered)} of ${n(total)} ${plural(total, { one: 'skill', other: 'skills' })} mastered`,
    skipMastered: 'Skip mastered skills',
    start: 'Start',
    chooseUnits: 'Choose units',
    noPractice: 'These units have no practice yet.',
    allMastered: 'Every skill in these units is mastered.',
    practiceAnyway: 'Practice them anyway',
  },

  pages: {
    home: {
      crumb: 'Home',
      titleLines: ['See the idea,', 'then the formula.'],
      lede: 'A personal course in mathematics, data engineering, machine learning and AI engineering. Each concept is something to see, then to read, then to practice.',
      continue: (item: string) => `Continue: ${item}`,
      start: 'Start here',
    },
    area: { eyebrow: 'Area', courses: 'Courses' },
    course: {
      eyebrow: 'Course',
      units: 'Units',
      unitNumber: (index: number) => `Unit ${n(index)}`,
      continueWith: (item: string) => `Continue: ${item}`,
    },
    unit: {
      eyebrow: 'Unit',
      position: (index: number, total: number) => `Unit ${n(index)} of ${n(total)}`,
      upNext: 'Up next',
      start: 'Start',
      continue: 'Continue',
      allDone: 'Every item in this unit is done. Practice and the checkpoint stay open for review.',
      checkpointPasses: (pass: number) => `Passes at ${formatPercent(pass)}`,
      terms: 'Terms introduced',
      termsIntro: 'Words and symbols this unit defines. Select one to read its summary.',
      markKnown: 'I already know this unit',
      unmarkKnown: 'Undo "I already know this unit"',
      markKnownHint:
        'Marks everything in this unit as done and every skill as mastered. You can undo it.',
      unmarkKnownHint:
        'Removes the marks set by this button. Anything you actually completed stays done.',
      recommendedFirst: 'Recommended first:',
      items: 'In this unit',
      planned: 'This unit is planned. Its content has not been written yet.',
      skills: 'Skills',
      skillsIntro:
        'What this unit teaches. Rate how well you know each skill, from new to mastered. This is your own assessment: it does not change the progress above, and you can change it at any time.',
    },
    notFound: { title: 'Nothing here.', back: 'Back to the index' },
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
