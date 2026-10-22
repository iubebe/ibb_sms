/** Orders for the table named "Online" (trim, case-insensitive) are delivery orders. */
export const isOnlineTableName = (name: string | null | undefined) =>
  name?.trim().toLowerCase() === 'online'

const pad = (n: number) => String(n).padStart(2, '0')

/** ISO timestamp -> `YYYY-MM-DDTHH:mm` in local time, the value format of `datetime-local` inputs. */
export function toDatetimeLocal(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** `datetime-local` value -> ISO timestamp; blank -> `null`, which clears it on the backend. */
export function fromDatetimeLocal(value: string) {
  return value ? new Date(value).toISOString() : null
}
