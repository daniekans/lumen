import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: "Practice: L'Hôpital and Newton",
  summary:
    "Every indeterminate form ($\\frac{0}{0}$, $\\frac{\\infty}{\\infty}$, $0 \\cdot \\infty$, $\\infty - \\infty$, $1^\\infty$, $\\infty^0$), continuous compounding, limits where the rule does not apply, and Newton's method: single steps, square roots, roots to four decimals, a minimum, and starts that fail.",
  tags: ["L'Hôpital's rule", 'indeterminate form', "Newton's method", 'practice'],
  level: 'core',
  order: 10,
  skills: ['lhopital', 'newtons-method'],
})
