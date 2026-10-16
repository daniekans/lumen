import clsx from 'clsx'
import { Keyboard } from 'lucide-react'
import type { MathfieldElement } from 'mathlive'
import { useEffect, useRef, useState } from 'react'
import { IconButton } from '../atoms'
import styles from './MathInput.module.css'
import './mathlive-theme.css'

let loading: Promise<void> | undefined

/** Loads MathLive once, on first use, and points it at the KaTeX fonts the app already loads. */
const loadMathLive = () =>
  (loading ??= import('mathlive').then(({ MathfieldElement }) => {
    MathfieldElement.fontsDirectory = null
    MathfieldElement.soundsDirectory = null
  }))

interface MathInputProps {
  /** TeX of the current content. */
  value: string
  onChange: (tex: string) => void
  /** Called on Enter. */
  onSubmit?: () => void
  label: string
  placeholder?: string
  status?: 'correct' | 'incorrect'
  autoFocus?: boolean
  readOnly?: boolean
}

/**
 * Math answer field (MathLive) with an on-screen keyboard on demand. Typing works like a calculator
 * with structure: `/` makes a fraction, `^` an exponent, `sqrt` a square root.
 */
export function MathInput({
  value,
  onChange,
  onSubmit,
  label,
  placeholder,
  status,
  autoFocus,
  readOnly,
}: MathInputProps) {
  const [ready, setReady] = useState(false)
  const field = useRef<MathfieldElement | null>(null)
  const latest = useRef({ onChange, onSubmit })
  useEffect(() => {
    latest.current = { onChange, onSubmit }
  })

  useEffect(() => {
    let alive = true
    void loadMathLive().then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const mf = field.current
    if (!ready || !mf) return
    mf.mathVirtualKeyboardPolicy = 'manual'
    mf.smartFence = true
    mf.menuItems = []
    if (placeholder) mf.placeholder = placeholder
    const onInput = () => latest.current.onChange(mf.value)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        latest.current.onSubmit?.()
      }
    }
    mf.addEventListener('input', onInput)
    mf.addEventListener('keydown', onKey)
    if (autoFocus) mf.focus()
    return () => {
      mf.removeEventListener('input', onInput)
      mf.removeEventListener('keydown', onKey)
    }
  }, [ready, autoFocus, placeholder])

  // Keep the field in sync when the value is changed from outside (e.g. cleared).
  useEffect(() => {
    const mf = field.current
    if (ready && mf && mf.value !== value) mf.value = value
  }, [ready, value])

  useEffect(() => {
    if (ready && field.current) field.current.readOnly = !!readOnly
  }, [ready, readOnly])

  return (
    <div className={styles.field}>
      <div className={clsx(styles.box, status && styles[status])}>
        {ready ? (
          <math-field ref={field} aria-label={label} />
        ) : (
          <div className={styles.loading}>Loading the math input…</div>
        )}
      </div>
      <IconButton
        label="Math keyboard"
        variant="default"
        disabled={!ready || readOnly}
        onClick={() => {
          field.current?.focus()
          const kb = window.mathVirtualKeyboard
          if (kb) kb.visible = !kb.visible
        }}
      >
        <Keyboard size={16} />
      </IconButton>
    </div>
  )
}
