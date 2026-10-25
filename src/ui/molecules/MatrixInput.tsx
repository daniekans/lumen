import { useRef } from 'react'
import { matrixCells, matrixTex } from '@/lib/practice'
import { KeyboardButton, MathInput } from './MathInput'
import styles from './MatrixInput.module.css'
import { msg } from '@/i18n'

interface MatrixInputProps {
  rows: number
  cols: number
  /** TeX of the whole matrix (`\begin{bmatrix} ... \end{bmatrix}`), or '' when every cell is empty. */
  value: string
  onChange: (tex: string) => void
  onSubmit?: () => void
  label: string
  /** Per cell: true right, false wrong, undefined unmarked. */
  marks?: readonly (readonly (boolean | undefined)[])[]
  autoFocus?: boolean
  readOnly?: boolean
}

/**
 * A matrix answer as a grid of small math fields between brackets, so the learner types entries
 * instead of matrix syntax. Tab moves between cells; one keyboard button serves them all.
 */
export function MatrixInput({
  rows,
  cols,
  value,
  onChange,
  onSubmit,
  label,
  marks,
  autoFocus,
  readOnly,
}: MatrixInputProps) {
  const cells = matrixCells(value)
  const at = (i: number, j: number) => cells[i]?.[j] ?? ''
  const grid = useRef<HTMLDivElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  const setCell = (i: number, j: number, tex: string) => {
    const next = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (r === i && c === j ? tex : at(r, c))),
    )
    onChange(next.flat().some((t) => t.trim()) ? matrixTex(next) : '')
  }

  return (
    <div className={styles.field}>
      <div
        ref={grid}
        className={styles.matrix}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(64px, 96px))` }}
        role="group"
        aria-label={label}
        onFocusCapture={(e) => {
          if (e.target instanceof HTMLElement) lastFocused.current = e.target
        }}
      >
        {Array.from({ length: rows }, (_, i) =>
          Array.from({ length: cols }, (_, j) => {
            const mark = marks?.[i]?.[j]
            return (
              <div key={`${i}-${j}`} className={styles.cell}>
                <MathInput
                  bare
                  label={msg.practice.matrixCell(i + 1, j + 1)}
                  value={at(i, j)}
                  onChange={(tex) => setCell(i, j, tex)}
                  onSubmit={onSubmit}
                  status={mark === undefined ? undefined : mark ? 'correct' : 'incorrect'}
                  autoFocus={autoFocus && i === 0 && j === 0}
                  readOnly={readOnly}
                />
              </div>
            )
          }),
        )}
      </div>
      <KeyboardButton
        disabled={readOnly}
        focus={() =>
          (lastFocused.current ?? grid.current?.querySelector<HTMLElement>('math-field'))?.focus()
        }
      />
    </div>
  )
}
