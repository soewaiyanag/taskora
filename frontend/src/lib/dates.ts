import type { Day } from '@/api/types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_MS = 86_400_000

const toUtc = (d: Day) => Date.parse(`${d}T00:00:00Z`)
export const addDays = (d: Day, n: number): Day => new Date(toUtc(d) + n * DAY_MS).toISOString().slice(0, 10)
export const diffDays = (a: Day, b: Day) => Math.round((toUtc(a) - toUtc(b)) / DAY_MS)

export function shortDate(d: Day) {
  const [, m, day] = d.split('-').map(Number)
  return `${MONTHS[(m ?? 1) - 1]} ${day}`
}
export function longDay(d: Day) {
  return `${WEEKDAYS[new Date(toUtc(d)).getUTCDay()]}, ${shortDate(d)}`
}

export function dueText(due: Day, today: Day, done: boolean) {
  const d = diffDays(due, today)
  if (!done && d < 0) return `Overdue · ${shortDate(due)}`
  if (d === 0) return 'Today'
  if (d === 1) return 'Tomorrow'
  return shortDate(due)
}

export function relDue(due: Day, today: Day, done: boolean) {
  if (done) return 'Done'
  const d = diffDays(due, today)
  if (d === 0) return 'Due today'
  if (d > 0) return `Due in ${d} day${d === 1 ? '' : 's'}`
  return `${-d} day${d === -1 ? '' : 's'} overdue`
}

/** "just now", "14 min ago", "3h ago", "Yesterday", then a date */
export function ago(iso: string, now = Date.now()) {
  const s = Math.max(0, (now - Date.parse(iso)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`
  if (s < 2 * 86_400) return 'Yesterday'
  return shortDate(iso.slice(0, 10))
}
/** the compact form used in the Inbox: 14m, 1h, Today */
export function agoShort(iso: string, now = Date.now()) {
  const s = Math.max(0, (now - Date.parse(iso)) / 1000)
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m`
  if (s < 4 * 3600) return `${Math.floor(s / 3600)}h`
  if (s < 86_400) return 'Today'
  return shortDate(iso.slice(0, 10))
}

/** the date rail: every card shares one 20-day window so bars compare across the board */
export const RAIL_DAYS = 20
const RAIL_LEAD = 7
export function railWindow(today: Day) {
  return { start: addDays(today, -RAIL_LEAD), days: RAIL_DAYS }
}
export function railGeometry(start: Day, due: Day, today: Day) {
  const w = railWindow(today)
  const s = Math.max(diffDays(start, w.start), 0)
  const e = Math.min(diffDays(due, w.start), w.days)
  return {
    left: (s / w.days) * 100,
    width: Math.max(2, ((e - s) / w.days) * 100),
    today: (RAIL_LEAD / w.days) * 100,
  }
}
