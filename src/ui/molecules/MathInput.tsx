import clsx from 'clsx'
import { Keyboard } from 'lucide-react'
import type { MathfieldElement } from 'mathlive'
import { useEffect, useRef, useState } from 'react'
import { IconButton, RichText } from '../atoms'
import styles from './MathInput.module.css'
import './mathlive-theme.css'
import { msg } from '@/i18n'

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
  /** Shown dimmed while the field is empty. Plain text with optional $TeX$. */
  placeholder?: string
  status?: 'correct' | 'incorrect'
  autoFocus?: boolean
  readOnly?: boolean
  /**
   * A cell of a larger input that has the keyboard button (`MatrixInput`): no button of its own,
   * and Tab moves focus in the page's order instead of between parts of the expression.
   */
  bare?: boolean
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
  bare,
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
    // MathLive moves its own focus on Tab, which races with the browser's; leave Tab to the page.
    if (bare) mf.keybindings = mf.keybindings.filter((k) => !k.key.endsWith('[Tab]'))
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
  }, [ready, autoFocus, bare])

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
      <div className={clsx(styles.box, bare && styles.bare, status && styles[status])}>
        {ready ? (
          <>
            <math-field ref={field} aria-label={label} />
            {/* An overlay, not MathLive's placeholder, so it can never look like typed content. */}
            {!value && placeholder && (
              <span className={styles.placeholder} aria-hidden>
                <RichText>{placeholder}</RichText>
              </span>
            )}
          </>
        ) : (
          <div className={styles.loading}>{msg.mathInput.loading}</div>
        )}
      </div>
      {!bare && (
        <KeyboardButton disabled={!ready || readOnly} focus={() => field.current?.focus()} />
      )}
    </div>
  )
}

/** Shows or hides the on-screen keyboard, which types into the focused field. */
export function KeyboardButton({ disabled, focus }: { disabled?: boolean; focus: () => void }) {
  return (
    <IconButton
      label={msg.mathInput.keyboard}
      variant="default"
      disabled={disabled}
      onClick={() => {
        focus()
        const kb = window.mathVirtualKeyboard
        if (kb) kb.visible = !kb.visible
      }}
    >
      <Keyboard size={16} />
    </IconButton>
  )
}
