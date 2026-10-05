const dateTime = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
const time = new Intl.DateTimeFormat('vi-VN', { timeStyle: 'short' })
const day = new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
const decimal = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 510 -> "8 giờ 30 phút" */
export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} phút`
  return m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`
}

/** Decimal hours for salary work: 510 -> "8,50" */
export function formatHours(minutes: number) {
  return decimal.format(minutes / 60)
}

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))
export const formatTime = (iso: string) => time.format(new Date(iso))
export const formatDay = (iso: string) => day.format(new Date(iso))

/** Whole minutes since an ISO timestamp (never negative). */
export function minutesSince(iso: string, now = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000))
}

/** `YYYY-MM` for a date in the browser's timezone. */
export function monthOf(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** "2026-10" moved by `delta` months. */
export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number)
  return monthOf(new Date(y, m - 1 + delta, 1))
}

/** "2026-10" -> "Tháng 10/2026" */
export function formatMonth(month: string) {
  const [y, m] = month.split('-')
  return `Tháng ${Number(m)}/${y}`
}

/** ISO -> value for `<input type="datetime-local">` (browser timezone). */
export function toLocalInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** `datetime-local` value -> ISO (the browser reads it as local time). */
export function fromLocalInput(value: string) {
  return new Date(value).toISOString()
}
