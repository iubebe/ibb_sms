import * as React from 'react'
import { Input } from '@/components/ui/input'

type CurrencyInputProps = Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'type' | 'inputMode'> & {
  /** Raw value: digits with an optional "." decimal point, e.g. "1250000" or "25000.5". */
  value: string
  onValueChange: (raw: string) => void
  allowDecimal?: boolean
  maxDigits?: number
}

/** Normalizes typed text to a raw number string (digits, one "." when decimals are allowed). */
function toRaw(text: string, allowDecimal: boolean, maxDigits: number) {
  const cleaned = text.replace(allowDecimal ? /[^\d,.]/g : /\D/g, '')
  if (!allowDecimal) return cleaned.slice(0, maxDigits).replace(/^0+(?=\d)/, '')
  // "," is the vi-VN decimal mark; "." is the thousand mark, so only "," starts decimals.
  const commaAt = cleaned.indexOf(',')
  const intPart = (commaAt === -1 ? cleaned : cleaned.slice(0, commaAt)).replace(/\D/g, '').slice(0, maxDigits)
  const int = intPart.replace(/^0+(?=\d)/, '')
  if (commaAt === -1) return int
  return `${int || '0'}.${cleaned.slice(commaAt + 1).replace(/\D/g, '')}`
}

/** "1250000.5" -> "1.250.000,5" */
function toDisplay(raw: string) {
  const [int, dec] = raw.split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return dec === undefined ? grouped : `${grouped},${dec}`
}

/** Money text field that shows thousand separators ("1.250.000") while keeping a plain numeric string in state. */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, allowDecimal = false, maxDigits = 12, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => innerRef.current!)
    const caret = React.useRef<number | null>(null)

    React.useLayoutEffect(() => {
      if (caret.current !== null && innerRef.current) {
        innerRef.current.setSelectionRange(caret.current, caret.current)
        caret.current = null
      }
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const el = e.target
      const raw = toRaw(el.value, allowDecimal, maxDigits)
      // Keep the caret after the same number of digits it followed before reformatting.
      const significant = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/[^\d,]/g, '').length
      const display = toDisplay(raw)
      let pos = 0
      let seen = 0
      while (pos < display.length && seen < significant) {
        if (/[\d,]/.test(display[pos])) seen++
        pos++
      }
      caret.current = pos
      onValueChange(raw)
    }

    return (
      <Input
        {...props}
        ref={innerRef}
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        value={toDisplay(value)}
        onChange={handleChange}
      />
    )
  },
)
CurrencyInput.displayName = 'CurrencyInput'
