import { en, type Messages } from './messages'

export * from './format'
export type { Messages }

/** The UI copy. Components read strings from here, never write them inline. */
export const msg: Messages = en
