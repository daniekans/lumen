/**
 * Paths that moved, so links shared before a reorganization keep working. Keys and values are ids
 * without a leading slash. Add an entry whenever an item, unit or course moves.
 */
export const redirects: Readonly<Record<string, string>> = {
  'calculus/derivative-as-limit': 'mathematics/calculus-1/derivatives/derivative-as-limit',
  'calculus/riemann-sums': 'mathematics/calculus-1/integrals/riemann-sums',
  'linear-algebra/matrix-transformations':
    'mathematics/linear-algebra/linear-transformations/matrix-transformations',
  'complex-numbers/complex-multiplication':
    'mathematics/complex-numbers/arithmetic/complex-multiplication',
  'neural-networks/forward-pass': 'machine-learning/neural-networks/foundations/forward-pass',
  'neural-networks/backpropagation': 'machine-learning/neural-networks/training/backpropagation',
  'ai-engineering/rag-pipeline': 'ai-engineering/retrieval/fundamentals/rag-pipeline',
  // Planned pre-calculus units merged or moved when the curriculum was reprioritized.
  'mathematics/pre-calculus/linear-and-quadratic':
    'mathematics/pre-calculus/polynomial-and-rational',
  'mathematics/pre-calculus/sequences-and-series': 'mathematics/pre-calculus',
  'mathematics/linear-algebra/linear-transformations': 'mathematics/linear-algebra/linear-maps',
  // A skill that moved to another unit: the key is the old unit id, '#', and the skill id.
  'mathematics/linear-algebra/linear-transformations#determinant':
    'mathematics/linear-algebra/determinants#determinant',
}

/**
 * Where an id lives now: follows redirects for the id itself or for the unit or course it sits
 * in (a moved unit moves its items), through chains of moves. Unknown ids come back unchanged.
 */
export const currentId = (id: string): string => {
  for (let hops = 0; hops < 10; hops++) {
    const exact = redirects[id]
    if (exact) {
      id = exact
      continue
    }
    const prefix = Object.keys(redirects).find((from) => id.startsWith(`${from}/`))
    if (!prefix) return id
    id = redirects[prefix] + id.slice(prefix.length)
  }
  return id
}
