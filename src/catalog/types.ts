import type { ComponentType, LazyExoticComponent } from 'react'

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

export interface UnitMeta {
  title: string
  description: string
  order: number
  skills?: readonly SkillMeta[]
  /** Unit ids (`area/course/unit`) worth taking first. Suggestions only. */
  prerequisites?: readonly string[]
}

export type ItemKind = 'explore' | 'lesson' | 'practice' | 'checkpoint'

export const kindLabel: Record<ItemKind, string> = {
  explore: 'Exploration',
  lesson: 'Lesson',
  practice: 'Practice',
  checkpoint: 'Checkpoint',
}
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

export type LazyComponent = LazyExoticComponent<ComponentType>
export type Loader = () => Promise<{ default: ComponentType }>

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
}

export interface Unit extends Omit<UnitMeta, 'skills'>, NodeBase {
  type: 'unit'
  areaId: string
  courseId: string
  skills: readonly Skill[]
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
