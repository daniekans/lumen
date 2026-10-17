/** The one locale for now. Every helper takes it from here, so adding a locale switch later is local. */
export const LOCALE = 'en'

const pluralRules = new Intl.PluralRules(LOCALE)
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })
const percent = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 0 })
const dateTime = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' })

/** Forms of a word or phrase by plural category. `other` is required; English uses `one` too. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }

/** Picks the form for `n`: `plural(3, { one: 'step', other: 'steps' })` is "steps". */
export const plural = (n: number, forms: PluralForms): string =>
  forms[pluralRules.select(n)] ?? forms.other

/** A count with its word: `count(1, { one: 'step', other: 'steps' })` is "1 step". */
export const count = (n: number, forms: PluralForms): string =>
  `${formatInteger(n)} ${plural(n, forms)}`

export const formatInteger = (n: number): string => integer.format(n)

/** A fraction in [0, 1] as a whole percentage: 0.8 is "80%". */
export const formatPercent = (fraction: number): string => percent.format(fraction)

export const formatDateTime = (value: Date | string): string => dateTime.format(new Date(value))
