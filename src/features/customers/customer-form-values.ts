export interface CustomerFormValues {
  name: string
  phone: string
  address: string
}

export const EMPTY_CUSTOMER: CustomerFormValues = { name: '', phone: '', address: '' }

const PHONE_SEPARATORS = /[\s.\-()]/g

/** Same rule as the backend: optional `+`, 8-15 digits once separators are removed. */
export function isValidPhone(phone: string) {
  const digits = phone.replace(PHONE_SEPARATORS, '')
  return digits === '' || /^\+?\d{8,15}$/.test(digits)
}

/** Blank -> `null`, which clears the field on the backend. */
export function toNullable(value: string) {
  return value.trim() || null
}
