import type { ComponentType, LazyExoticComponent } from 'react'
import type { SectionId } from './sections'

export type VizLevel = 'intro' | 'core' | 'advanced'
export type VizStatus = 'draft' | 'published'

/** A narrative beat. The explanation pane lists steps and the visualization reacts to the active one. */
export interface VizStep {
  id: string
  title: string
  /** One or two sentences shown under the step title. Inline TeX is allowed between $...$. */
  caption: string
}

/** What a visualization declares in its `meta.ts`. Section and slug come from the folder path. */
export interface VizMeta {
  title: string
  summary: string
  tags: readonly string[]
  level: VizLevel
  /** Sort position inside the section. Lower comes first. */
  order: number
  steps?: readonly VizStep[]
  status?: VizStatus
}

export interface VizEntry extends VizMeta {
  /** `${section}/${slug}`, also the route path. */
  id: string
  section: SectionId
  slug: string
  /** Code-split component. Nothing is fetched until it first renders. */
  Component: LazyExoticComponent<ComponentType>
  Explanation?: LazyExoticComponent<ComponentType>
  /** Starts fetching the component chunk, e.g. on hover, without rendering it. */
  preload: () => Promise<unknown>
}

export const defineViz = <const T extends VizMeta>(meta: T): T => meta
