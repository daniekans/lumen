import { useId } from 'react'
import { RichText, Switch, type SwitchProps } from '../atoms'
import styles from './ToggleField.module.css'

interface ToggleFieldProps extends Omit<SwitchProps, 'id'> {
  label: string
}

export function ToggleField({ label, ...rest }: ToggleFieldProps) {
  const id = useId()
  return (
    <label className={styles.field} htmlFor={id}>
      <Switch id={id} {...rest} />
      <RichText>{label}</RichText>
    </label>
  )
}
