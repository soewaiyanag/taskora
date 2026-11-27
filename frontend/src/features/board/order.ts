import { STATUSES, type StatusId, type Task } from '@/api/types'

export type Lanes = Record<StatusId, Task[]>

export function toLanes(tasks: Task[]): Lanes {
  const lanes = Object.fromEntries(STATUSES.map((s) => [s.id, [] as Task[]])) as Lanes
  for (const t of tasks) lanes[t.status].push(t)
  for (const s of STATUSES) lanes[s.id].sort((a, b) => a.position - b.position)
  return lanes
}

/** The same move the server makes: into `status`, before `beforeCode` (or last), lane renumbered. Pure. */
export function moveTask(tasks: Task[], code: string, status: StatusId, beforeCode: string | null): Task[] {
  const moving = tasks.find((t) => t.code === code)
  if (!moving) return tasks
  const lane = tasks.filter((t) => t.status === status && t.code !== code).sort((a, b) => a.position - b.position)
  const at = beforeCode ? lane.findIndex((t) => t.code === beforeCode) : -1
  lane.splice(at === -1 ? lane.length : at, 0, { ...moving, status })
  const positions = new Map(lane.map((t, i) => [t.code, i]))
  return tasks.map((t) => {
    const p = positions.get(t.code)
    if (p === undefined) return t
    return t.code === code ? { ...t, status, position: p } : { ...t, position: p }
  })
}

/** where a task sits now, so a move can be undone exactly */
export function slotOf(tasks: Task[], code: string): { status: StatusId; beforeCode: string | null } | null {
  const t = tasks.find((x) => x.code === code)
  if (!t) return null
  const lane = toLanes(tasks)[t.status]
  const i = lane.findIndex((x) => x.code === code)
  return { status: t.status, beforeCode: lane[i + 1]?.code ?? null }
}
