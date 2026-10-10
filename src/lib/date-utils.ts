/** Get the Monday (week start) of the week containing the given date */
export function getWeekStartDate(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

/** Add/subtract weeks from a date string (YYYY-MM-DD) */
export function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setDate(d.getDate() + weeks * 7)
  return d.toISOString().split('T')[0]
}

/** Get day name from dayOfWeek (1=Monday, 7=Sunday) */
export function getDayName(dayOfWeek: number): string {
  const days = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
  return days[dayOfWeek] || ''
}

/** Get full date from weekStartDate and dayOfWeek */
export function getShiftDate(weekStartDate: string, dayOfWeek: number): Date {
  const d = new Date(weekStartDate + 'T00:00:00Z')
  const offsetDays = dayOfWeek - 1 // dayOfWeek 1 = Monday = offset 0
  d.setDate(d.getDate() + offsetDays)
  return d
}
