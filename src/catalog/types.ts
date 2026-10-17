import type { ComponentType, LazyExoticComponent } from 'react'
import type { ProblemGenerator } from '@/lib/practice/problems'

/*
 * Content hierarchy: Area > Course > Unit > Item. Content files declare metadata with the
 * define* helpers; ids, paths and parent links are derived from the folder structure.
 */

export type AreaIcon = 'sigma' | 'database' | 'network' | 'sparkles'

export interface AreaMeta {
  id: string
  title: string
  description: string
  icon: AreaIcon
}

export interface CourseMeta {
  title: string
  description: string
  /** Sort position inside the area. Lower comes first. */
  order: number
  /** Course ids (`area/course`) worth taking first. Suggestions only. */
  prerequisites?: readonly string[]
}

export interface SkillMeta {
  /** Local id, unique inside the unit. */
  id: string
  title: string
}

/**
 * A glossary or notation entry, declared by the unit whose item introduces it. Explanations link a
 * word to it with <Term id="...">; those links are how the index knows where a term is used.
 */
export interface TermMeta {
  /** Global id, unique across the whole catalog (it is the anchor on the glossary page). */
  id: string
  title: string
  /** The symbol, when the entry is notation, e.g. `f^{-1}`. */
  tex?: string
  /** One or two sentences. Inline TeX is allowed between $...$. */
  summary: string
  /** Slug of the item in this unit that introduces the term. */
  introducedIn: string
}

export interface UnitMeta {
  title: string
  description: string
  order: number
  skills?: readonly SkillMeta[]
  terms?: readonly TermMeta[]
  /** Unit ids (`area/course/unit`) worth taking first. Suggestions only. */
  prerequisites?: readonly string[]
}

export type ItemKind = 'explore' | 'lesson' | 'practice' | 'checkpoint'

export type ItemLevel = 'intro' | 'core' | 'advanced'
export type ItemStatus = 'draft' | 'published'

/** A question attached to a lesson step. Answering is never required to move on. */
export type StepCheck =
  | {
      kind: 'choice'
      prompt: string
      options: readonly string[]
      /** Index of the correct option. */
      answer: number
      /** Shown after answering, right or wrong. */
      explanation?: string
    }
  | {
      kind: 'number'
      prompt: string
      answer: number
      /** Absolute tolerance. Defaults to 1e-6. */
      tolerance?: number
      explanation?: string
    }

/** A narrative beat. The explanation pane lists steps and the visualization reacts to the active one. */
export interface VizStep {
  id: string
  title: string
  /** One or two sentences shown under the step title. Inline TeX is allowed between $...$. */
  caption: string
  check?: StepCheck
}

export interface ItemMeta {
  kind?: ItemKind
  title: string
  summary: string
  tags: readonly string[]
  level: ItemLevel
  order: number
  /** Local skill ids of the parent unit that this item teaches or exercises. */
  skills?: readonly string[]
  steps?: readonly VizStep[]
  status?: ItemStatus
  /** Checkpoints: how many problems one attempt contains. Defaults to 8. */
  problemCount?: number
}

interface NodeBase {
  /** Slash-separated path from the area, e.g. `mathematics/calculus-1`. */
  id: string
  /** Last segment of the id. */
  slug: string
  /** Route path, `/${id}`. */
  path: string
}

export interface Skill extends SkillMeta {
  /** Global id: `${unitId}#${localId}`. */
  key: string
  unitId: string
}

export interface Term extends Omit<TermMeta, 'introducedIn'> {
  type: 'term'
  /** Route path of the entry on the glossary page. */
  path: string
  unitId: string
  /** Id of the item that introduces the term. */
  introducedIn: string
  /** Ids of the other items whose explanation links the term, in reading order. */
  usedIn: readonly string[]
}

export type LazyComponent = LazyExoticComponent<ComponentType>
export type Loader = () => Promise<{ default: ComponentType }>
export type ProblemsModule = { problems: readonly ProblemGenerator[] }
export type ProblemsLoader = () => Promise<ProblemsModule>

export interface Item extends Omit<ItemMeta, 'kind'>, NodeBase {
  type: 'item'
  kind: ItemKind
  areaId: string
  courseId: string
  unitId: string
  /** Global skill keys. */
  skillKeys: readonly string[]
  Component: LazyComponent
  Explanation?: LazyComponent
  /** Starts fetching the component chunk without rendering it. */
  preload: () => Promise<unknown>
  /** Practice and checkpoint items: their problem generators. */
  loadProblems?: ProblemsLoader
}

export interface Unit extends Omit<UnitMeta, 'skills' | 'terms'>, NodeBase {
  type: 'unit'
  areaId: string
  courseId: string
  skills: readonly Skill[]
  terms: readonly Term[]
  items: readonly Item[]
}

export interface Course extends CourseMeta, NodeBase {
  type: 'course'
  areaId: string
  units: readonly Unit[]
}

export interface Area extends AreaMeta, NodeBase {
  type: 'area'
  courses: readonly Course[]
}

export type CatalogNode = Area | Course | Unit | Item

export const defineArea = <const T extends AreaMeta>(meta: T): T => meta
export const defineCourse = <const T extends CourseMeta>(meta: T): T => meta
export const defineUnit = <const T extends UnitMeta>(meta: T): T => meta
export const defineItem = <const T extends ItemMeta>(meta: T): T => meta
