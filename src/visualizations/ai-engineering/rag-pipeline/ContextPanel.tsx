import { useEffect, useRef, type ReactNode } from 'react'
import { fmt } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { answerFor, chunks, promptLines, question, queryPos, type Ranked } from './data'
import styles from './ContextPanel.module.css'

interface ContextPanelProps {
  phase: number
  /** Progress of the current phase's reveal, 0 to 1. */
  reveal: number
  retrieved: readonly Ranked[]
  k: number
  /** Overrides the header with a description of a hovered or selected node. */
  focus?: { title: string; description: string }
}

const titles = ['Chunks', 'Stored vectors', 'Question', 'Retrieved context', 'Prompt', 'Answer']
const hints = [
  '10 chunks from 3 help-center articles',
  'Each chunk with its position in the 2D view',
  'Embedded with the same model as the chunks',
  'Nearest chunks by distance to the question',
  'What the language model actually receives',
  'Generated from the prompt, citing chunk numbers',
]

/** Text side of the pipeline: shows the data that is flowing at the current step. */
export function ContextPanel({ phase, reveal, retrieved, k, focus }: ContextPanelProps) {
  const body = useRef<HTMLDivElement>(null)
  const content = renderBody(phase, reveal, retrieved, k)
  const length = phase === 4 ? Math.ceil(reveal * 10) : phase === 5 ? Math.floor(reveal * 20) : 0

  // Keep the newest prompt line or answer token in view while text is being revealed.
  useEffect(() => {
    if ((phase === 4 || phase === 5) && body.current)
      body.current.scrollTop = body.current.scrollHeight
  }, [phase, length])

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.title}>{focus?.title ?? titles[phase]}</span>
        <span className={styles.hint}>{focus?.description ?? hints[phase]}</span>
      </div>
      <div ref={body} className={styles.body}>
        {content}
      </div>
    </div>
  )
}

const visible = (reveal: number, i: number, n: number) => (reveal * n > i ? 1 : 0)

function renderBody(
  phase: number,
  reveal: number,
  retrieved: readonly Ranked[],
  k: number,
): ReactNode {
  switch (phase) {
    case 0:
    case 1:
      return (
        <ul className={styles.rows}>
          {chunks.map((c, i) => {
            const shown = phase === 0 ? visible(reveal, i, chunks.length) : 1
            const embedded = phase === 1 ? visible(reveal, i, chunks.length) : 0
            return (
              <li key={c.id} className={styles.row}>
                <span className={styles.id} style={{ opacity: shown }}>
                  c{c.id}
                </span>
                <span className={styles.text} style={{ opacity: shown }}>
                  {c.text}
                </span>
                <span className={styles.meta} style={{ opacity: embedded, color: vc.blue }}>
                  [{fmt(c.pos[0])}, {fmt(c.pos[1])}]
                </span>
              </li>
            )
          })}
        </ul>
      )
    case 2:
      return (
        <>
          <p className={styles.question}>“{question}”</p>
          <p
            className={styles.mono}
            style={{ opacity: reveal > 0.5 ? 1 : 0, transition: 'opacity 400ms' }}
          >
            <span style={{ color: vc.yellow }}>q</span> = [{fmt(queryPos[0])}, {fmt(queryPos[1])}]
          </p>
        </>
      )
    case 3:
      return (
        <ul className={styles.rows}>
          {retrieved.map((r, i) => (
            <li key={r.chunk.id} className={styles.row}>
              <span
                className={styles.id}
                style={{ opacity: visible(reveal, i, k), color: vc.yellow }}
              >
                [{i + 1}]
              </span>
              <span className={styles.text} style={{ opacity: visible(reveal, i, k) }}>
                {r.chunk.text}
              </span>
              <span className={styles.meta} style={{ opacity: visible(reveal, i, k) }}>
                d = {fmt(r.distance)}
              </span>
            </li>
          ))}
        </ul>
      )
    case 4: {
      const lines = promptLines(retrieved)
      const n = Math.ceil(reveal * lines.length)
      return <pre className={styles.mono}>{lines.slice(0, n).join('\n')}</pre>
    }
    default: {
      const answer = answerFor(k)
      const n = Math.floor(reveal * answer.length)
      return (
        <>
          <p className={styles.mono}>Question: {question}</p>
          <p className={styles.answer}>
            {answer.slice(0, n)}
            {n < answer.length && <span className={styles.caret} />}
          </p>
        </>
      )
    }
  }
}
