/** Small line drawing that identifies a course. Strokes use currentColor. */
const glyphs: Record<string, string> = {
  'pre-calculus': 'M4 40 C14 40 18 4 28 4 M28 4 L52 40',
  'calculus-1': 'M4 36 C14 36 16 8 26 8 S38 30 44 30',
  'linear-algebra': 'M8 40 L20 8 M8 40 L42 30 M20 8 L54 -2 M42 30 L54 -2',
  'complex-numbers': 'M24 4 A20 20 0 1 1 23.9 4 M24 24 L38 10',
  'neural-networks': 'M6 10 L24 24 L42 16 M6 24 L24 24 M6 38 L24 24 L42 32',
  retrieval: 'M2 24 H14 M22 24 H30 M38 24 H46 M14 16 H22 V32 H14 Z M30 16 H38 V32 H30 Z',
  'relational-foundations': 'M6 8 H30 V40 H6 Z M6 18 H30 M24 14 H50 V36 H24',
}
const fallback = 'M6 40 L24 6 L42 40 Z'

export const CourseGlyph = ({ course, size = 48 }: { course: string; size?: number }) => (
  <svg width={size} height={size} viewBox="-2 -4 60 50" aria-hidden>
    <path
      d={glyphs[course] ?? fallback}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
    />
  </svg>
)
