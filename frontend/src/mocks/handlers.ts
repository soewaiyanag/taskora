import { delay, http, HttpResponse, type JsonBodyType } from 'msw'
import {
  commentSchema,
  inviteSchema,
  loginSchema,
  prefixSchema,
  profileSchema,
  signupSchema,
  taskTitleSchema,
  workspaceNameSchema,
} from '@/api/schemas'
import {
  STATUSES,
  statusName,
  PRIORITIES,
  type Ink,
  type Member,
  type MyTask,
  type Session,
  type StatusId,
  type Task,
  type User,
  type Workspace,
} from '@/api/types'
import { addDays } from '@/lib/dates'
import { getDb, resetDb, save, sessionUserId, setSession } from './db'
import { DEMO_EMAIL, defaultPrefs, type DbUser } from './seed'

const API = '/api/v1'
const LATENCY_MS = 140
const NEW_TASK_DAYS = 5
const INKS: Ink[] = ['ochre', 'harbour', 'rosewood', 'sage', 'teal']

const problem = (status: number, title: string, detail = '') =>
  HttpResponse.json({ type: 'about:blank', title, status, detail }, { status, headers: { 'Content-Type': 'application/problem+json' } })
const ok = (body: JsonBodyType, status = 200) => HttpResponse.json(body, { status })
const now = () => new Date().toISOString()
let idSeq = Date.now()
const newId = (p: string) => `${p}${(idSeq++).toString(36)}`

const initials = (name: string) => {
  const p = name.trim().split(/\s+/).filter(Boolean)
  const first = p[0]?.[0] ?? '?'
  const last = p.length > 1 ? (p[p.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}
const toUser = (u: DbUser): User => ({ id: u.id, name: u.name, email: u.email, initials: initials(u.name), ink: u.ink })

function me() {
  const id = sessionUserId()
  return getDb().users.find((u) => u.id === id) ?? null
}
function session(u: DbUser): Session {
  const workspaces = getDb()
    .workspaces.filter((w) => w.members.some((m) => m.userId === u.id))
    .map((w) => ({ slug: w.slug, name: w.name }))
  return { user: toUser(u), workspaces }
}

/** every workspace route goes through here: signed in, and a member (tenancy) */
function scope(slug: string | readonly string[] | undefined) {
  const u = me()
  if (!u) return { error: problem(401, 'Not signed in') }
  const ws = getDb().workspaces.find((w) => w.slug === slug)
  const membership = ws?.members.find((m) => m.userId === u.id)
  if (!ws || !membership) return { error: problem(404, 'Workspace not found') }
  return { u, ws, membership }
}
function taskScope(code: string | readonly string[] | undefined) {
  const u = me()
  if (!u) return { error: problem(401, 'Not signed in') }
  const t = getDb().tasks.find((x) => x.code === code)
  const ws = t && getDb().workspaces.find((w) => w.lists.some((l) => l.id === t.listId))
  if (!t || !ws || !ws.members.some((m) => m.userId === u.id)) return { error: problem(404, 'Task not found') }
  return { u, t, ws }
}

function fullWorkspace(ws: ReturnType<typeof getDb>['workspaces'][number]): Workspace {
  const db = getDb()
  const members: Member[] = ws.members.flatMap(({ userId, role }) => {
    const u = db.users.find((x) => x.id === userId)
    return u ? [{ ...toUser(u), role, online: u.online, lastActive: u.lastActive }] : []
  })
  const spaces = ws.spaces.map((s) => ({
    ...s,
    taskCount: db.tasks.filter((t) => ws.lists.some((l) => l.id === t.listId && l.spaceId === s.id)).length,
  }))
  return { ...ws, spaces, members }
}

const laneOf = (listId: string, status: StatusId, except?: string) =>
  getDb()
    .tasks.filter((t) => t.listId === listId && t.status === status && t.code !== except)
    .sort((a, b) => a.position - b.position)

/** puts the task in its lane before `beforeCode` (or last) and renumbers the lane */
function place(t: Task, status: StatusId, beforeCode: string | null) {
  const lane = laneOf(t.listId, status, t.code)
  const at = beforeCode ? lane.findIndex((x) => x.code === beforeCode) : -1
  lane.splice(at === -1 ? lane.length : at, 0, t)
  t.status = status
  lane.forEach((x, i) => {
    x.position = i
  })
}

function log(t: Task, who: string, text: string, comment = false) {
  t.activity.push({ id: newId('a'), who, text, comment, at: now() })
}

function notify(userId: string, n: { who: string | null; taskCode: string; verb: string; quote?: string | null }) {
  const db = getDb()
  ;(db.notifications[userId] ??= []).unshift({ id: newId('n'), quote: null, at: now(), unread: true, ...n })
}

async function body<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

export const handlers = [
  http.all(`${API}/*`, async () => {
    await delay(LATENCY_MS)
  }),

  /* ---------- auth ---------- */
  http.post(`${API}/auth/login`, async ({ request }) => {
    const parsed = loginSchema.safeParse(await body(request))
    if (!parsed.success) return problem(422, 'Check the form', parsed.error.issues[0]?.message)
    const u = getDb().users.find((x) => x.email.toLowerCase() === parsed.data.email.toLowerCase())
    if (!u || u.password !== parsed.data.password)
      return problem(401, 'Wrong email or password', 'That email and password don’t match. Check both and try again.')
    setSession(u.id)
    return ok(session(u))
  }),
  http.post(`${API}/auth/demo`, () => {
    const u = getDb().users.find((x) => x.email === DEMO_EMAIL)!
    setSession(u.id)
    return ok(session(u))
  }),
  http.post(`${API}/auth/signup`, async ({ request }) => {
    const parsed = signupSchema.safeParse(await body(request))
    if (!parsed.success) return problem(422, 'Check the form', parsed.error.issues[0]?.message)
    const db = getDb()
    const { name, email, password } = parsed.data
    if (db.users.some((x) => x.email.toLowerCase() === email.toLowerCase()))
      return problem(409, 'Email already registered', 'An account with that email already exists. Log in instead.')
    const u: DbUser = { id: newId('u'), name, email, password, ink: INKS[0]!, online: true, lastActive: 'Online' }
    db.users.push(u)
    const first = name.split(/\s+/)[0] ?? name
    const slug = `${first.toLowerCase().replace(/[^a-z0-9]/g, '') || 'my'}-${(idSeq++).toString(36)}`
    const today = new Date().toISOString().slice(0, 10)
    db.workspaces.push({
      slug,
      name: `${first}’s workspace`,
      demo: false,
      today,
      updatedAt: today,
      spaces: [{ id: newId('s'), name: 'Personal', prefix: 'TASK', nextNumber: 1, taskCount: 0 }],
      folders: [],
      lists: [],
      members: [{ userId: u.id, role: 'Owner' }],
    })
    const ws = db.workspaces[db.workspaces.length - 1]!
    ws.lists.push({ id: newId('l'), name: 'First list', spaceId: ws.spaces[0]!.id, folderId: null, range: null })
    db.invites[slug] = { link: `taskora.app/join/${slug}/${newId('k')}`, expires: addDays(today, 7), invites: [] }
    setSession(u.id)
    save()
    return ok(session(u), 201)
  }),
  http.post(`${API}/auth/logout`, () => {
    setSession(null)
    return new HttpResponse(null, { status: 204 })
  }),
  http.get(`${API}/me`, () => {
    const u = me()
    return u ? ok(session(u)) : problem(401, 'Not signed in')
  }),
  http.patch(`${API}/me`, async ({ request }) => {
    const u = me()
    if (!u) return problem(401, 'Not signed in')
    const parsed = profileSchema.safeParse(await body(request))
    if (!parsed.success) return problem(422, 'Check the form', parsed.error.issues[0]?.message)
    const taken = getDb().users.some((x) => x.id !== u.id && x.email.toLowerCase() === parsed.data.email.toLowerCase())
    if (taken) return problem(409, 'Email already in use', 'Someone else uses that email.')
    Object.assign(u, parsed.data)
    save()
    return ok(session(u))
  }),
  http.get(`${API}/me/notification-prefs`, () => {
    const u = me()
    if (!u) return problem(401, 'Not signed in')
    return ok(getDb().prefs[u.id] ?? defaultPrefs())
  }),
  http.patch(`${API}/me/notification-prefs/:id`, async ({ params, request }) => {
    const u = me()
    if (!u) return problem(401, 'Not signed in')
    const db = getDb()
    const prefs = (db.prefs[u.id] ??= defaultPrefs())
    const p = prefs.find((x) => x.id === params.id)
    const patch = await body<{ inbox?: boolean; email?: boolean }>(request)
    if (!p || !patch) return problem(404, 'Setting not found')
    if (typeof patch.email === 'boolean') p.email = patch.email
    if (typeof patch.inbox === 'boolean' && p.inbox !== null) p.inbox = patch.inbox
    save()
    return ok(prefs)
  }),

  /* ---------- workspaces ---------- */
  http.get(`${API}/workspaces/:ws`, ({ params }) => {
    const s = scope(params.ws)
    return s.error ?? ok(fullWorkspace(s.ws))
  }),
  http.patch(`${API}/workspaces/:ws`, async ({ params, request }) => {
    const s = scope(params.ws)
    if (s.error) return s.error
    if (s.membership.role === 'Member') return problem(403, 'Only owners and admins can change this')
    const name = workspaceNameSchema.safeParse((await body<{ name?: string }>(request))?.name)
    if (!name.success) return problem(422, 'A workspace needs a name')
    s.ws.name = name.data
    s.ws.updatedAt = new Date().toISOString().slice(0, 10)
    save()
    return ok(fullWorkspace(s.ws))
  }),
  http.delete(`${API}/workspaces/:ws`, ({ params }) => {
    const s = scope(params.ws)
    if (s.error) return s.error
    if (s.ws.demo) return problem(403, 'Deleting is switched off in the demo', 'In the demo, deleting is switched off.')
    if (s.membership.role !== 'Owner') return problem(403, 'Only the owner can delete the workspace')
    const db = getDb()
    db.tasks = db.tasks.filter((t) => !s.ws.lists.some((l) => l.id === t.listId))
    db.workspaces = db.workspaces.filter((w) => w !== s.ws)
    save()
    return new HttpResponse(null, { status: 204 })
  }),
  http.patch(`${API}/workspaces/:ws/spaces/:space`, async ({ params, request }) => {
    const s = scope(params.ws)
    if (s.error) return s.error
    if (s.membership.role === 'Member') return problem(403, 'Only owners and admins can change this')
    const space = s.ws.spaces.find((x) => x.id === params.space)
    const prefix = prefixSchema.safeParse((await body<{ prefix?: string }>(request))?.prefix)
    if (!space) return problem(404, 'Space not found')
    if (!prefix.success) return problem(422, 'A prefix needs 2 to 5 letters or digits')
    space.prefix = prefix.data
    save()
    return ok(fullWorkspace(s.ws))
  }),
  http.patch(`${API}/workspaces/:ws/members/:user`, async ({ params, request }) => {
    const s = scope(params.ws)
    if (s.error) return s.error
    if (s.membership.role === 'Member') return problem(403, 'Only owners and admins can change roles')
    const m = s.ws.members.find((x) => x.userId === params.user)
    const role = (await body<{ role?: string }>(request))?.role
    if (!m) return problem(404, 'Member not found')
    if (m.role === 'Owner' || (role !== 'Admin' && role !== 'Member')) return problem(422, 'The owner’s role can’t change here')
    m.role = role
    save()
    return ok(fullWorkspace(s.ws))
  }),
  http.get(`${API}/workspaces/:ws/invites`, ({ params }) => {
    const s = scope(params.ws)
    return s.error ?? ok(getDb().invites[s.ws.slug] ?? { link: '', expires: s.ws.today, invites: [] })
  }),
  http.post(`${API}/workspaces/:ws/invites`, async ({ params, request }) => {
    const s = scope(params.ws)
    if (s.error) return s.error
    const parsed = inviteSchema.safeParse(await body(request))
    if (!parsed.success) return problem(422, 'Enter an email address to invite')
    const state = getDb().invites[s.ws.slug]!
    if (state.invites.some((i) => i.email.toLowerCase() === parsed.data.email.toLowerCase()))
      return problem(409, 'Already invited', `${parsed.data.email} already has an invite.`)
    state.invites.unshift({ id: newId('i'), email: parsed.data.email, role: parsed.data.role, invitedBy: s.u.id, at: now() })
    save()
    return ok(state, 201)
  }),
  http.delete(`${API}/workspaces/:ws/invites/:id`, ({ params }) => {
    const s = scope(params.ws)
    if (s.error) return s.error
    const state = getDb().invites[s.ws.slug]!
    state.invites = state.invites.filter((i) => i.id !== params.id)
    save()
    return ok(state)
  }),
  http.post(`${API}/workspaces/:ws/invite-link`, ({ params }) => {
    const s = scope(params.ws)
    if (s.error) return s.error
    const state = getDb().invites[s.ws.slug]!
    state.link = `taskora.app/join/${s.ws.slug}/${Math.random().toString(36).slice(2, 10)}`
    save()
    return ok(state)
  }),
  http.get(`${API}/workspaces/:ws/my-tasks`, ({ params }) => {
    const s = scope(params.ws)
    if (s.error) return s.error
    const mine: MyTask[] = getDb()
      .tasks.filter((t) => t.ownerId === s.u.id)
      .flatMap((t) => {
        const list = s.ws.lists.find((l) => l.id === t.listId)
        const space = list && s.ws.spaces.find((x) => x.id === list.spaceId)
        return list && space ? [{ ...t, where: [space.name, list.name] as [string, string] }] : []
      })
      .sort((a, b) => a.due.localeCompare(b.due))
    return ok(mine)
  }),
  http.post(`${API}/workspaces/:ws/reset-demo`, ({ params }) => {
    const s = scope(params.ws)
    if (s.error) return s.error
    if (!s.ws.demo) return problem(403, 'Only the demo can be reset')
    resetDb()
    return new HttpResponse(null, { status: 204 })
  }),

  /* ---------- lists and tasks ---------- */
  http.get(`${API}/lists/:list/tasks`, ({ params }) => {
    const u = me()
    if (!u) return problem(401, 'Not signed in')
    const ws = getDb().workspaces.find((w) => w.lists.some((l) => l.id === params.list))
    if (!ws || !ws.members.some((m) => m.userId === u.id)) return problem(404, 'List not found')
    return ok(getDb().tasks.filter((t) => t.listId === params.list))
  }),
  http.post(`${API}/lists/:list/tasks`, async ({ params, request }) => {
    const u = me()
    if (!u) return problem(401, 'Not signed in')
    const ws = getDb().workspaces.find((w) => w.lists.some((l) => l.id === params.list))
    const list = ws?.lists.find((l) => l.id === params.list)
    if (!ws || !list || !ws.members.some((m) => m.userId === u.id)) return problem(404, 'List not found')
    const input = await body<{ title?: string; status?: StatusId }>(request)
    const title = taskTitleSchema.safeParse(input?.title)
    const status = STATUSES.find((x) => x.id === input?.status)?.id ?? 'todo'
    if (!title.success) return problem(422, 'A task needs a title')
    const space = ws.spaces.find((x) => x.id === list.spaceId)!
    const t: Task = {
      code: `${space.prefix}-${space.nextNumber++}`,
      listId: list.id,
      status,
      ownerId: u.id,
      priority: 2,
      start: ws.today,
      due: addDays(ws.today, NEW_TASK_DAYS),
      title: title.data,
      tags: [],
      description: '',
      checklist: [],
      activity: [],
      position: -1,
    }
    log(t, u.id, 'created this task')
    getDb().tasks.push(t)
    place(t, status, laneOf(list.id, status, t.code)[0]?.code ?? null)
    save()
    return ok(t, 201)
  }),
  http.get(`${API}/tasks/:code`, ({ params }) => {
    const s = taskScope(params.code)
    return s.error ?? ok(s.t)
  }),
  http.post(`${API}/tasks/:code/move`, async ({ params, request }) => {
    const s = taskScope(params.code)
    if (s.error) return s.error
    const input = await body<{ status?: StatusId; beforeCode?: string | null }>(request)
    const status = STATUSES.find((x) => x.id === input?.status)?.id
    if (!status) return problem(422, 'Unknown status')
    // the demo simulates a teammate's move; a real server takes the actor from the session only
    const actorHeader = request.headers.get('X-Demo-Actor')
    const actor = s.ws.demo && actorHeader && s.ws.members.some((m) => m.userId === actorHeader) ? actorHeader : s.u.id
    const from = s.t.status
    place(s.t, status, input?.beforeCode ?? null)
    if (from !== status) {
      log(s.t, actor, `moved this to ${statusName(status)}`)
      if (s.t.ownerId !== actor) notify(s.t.ownerId, { who: actor, taskCode: s.t.code, verb: `moved to ${statusName(status)}` })
    }
    save()
    return ok(getDb().tasks.filter((t) => t.listId === s.t.listId))
  }),
  http.patch(`${API}/tasks/:code`, async ({ params, request }) => {
    const s = taskScope(params.code)
    if (s.error) return s.error
    const patch = await body<{ ownerId?: string; priority?: number }>(request)
    if (!patch) return problem(422, 'Nothing to change')
    if (patch.ownerId !== undefined) {
      const owner = getDb().users.find((x) => x.id === patch.ownerId)
      if (!owner || !s.ws.members.some((m) => m.userId === owner.id)) return problem(422, 'Not a member of this workspace')
      if (owner.id !== s.t.ownerId) {
        s.t.ownerId = owner.id
        log(s.t, s.u.id, `assigned this to ${owner.name}`)
        if (owner.id !== s.u.id) notify(owner.id, { who: s.u.id, taskCode: s.t.code, verb: 'assigned you' })
      }
    }
    if (patch.priority !== undefined) {
      const p = PRIORITIES[patch.priority]
      if (!p) return problem(422, 'Unknown priority')
      s.t.priority = patch.priority as Task['priority']
      log(s.t, s.u.id, `set priority to ${p}`)
    }
    save()
    return ok(s.t)
  }),
  http.post(`${API}/tasks/:code/checklist/:index`, async ({ params, request }) => {
    const s = taskScope(params.code)
    if (s.error) return s.error
    const item = s.t.checklist[Number(params.index)]
    const done = (await body<{ done?: boolean }>(request))?.done
    if (!item || typeof done !== 'boolean') return problem(422, 'Unknown checklist item')
    item.done = done
    log(s.t, s.u.id, `${done ? 'checked' : 'unchecked'} “${item.text}”`)
    save()
    return ok(s.t)
  }),
  http.post(`${API}/tasks/:code/comments`, async ({ params, request }) => {
    const s = taskScope(params.code)
    if (s.error) return s.error
    const text = commentSchema.safeParse((await body<{ text?: string }>(request))?.text)
    if (!text.success) return problem(422, 'A comment can’t be empty')
    log(s.t, s.u.id, text.data, true)
    save()
    return ok(s.t, 201)
  }),

  /* ---------- inbox ---------- */
  http.get(`${API}/notifications`, () => {
    const u = me()
    if (!u) return problem(401, 'Not signed in')
    return ok(getDb().notifications[u.id] ?? [])
  }),
  http.post(`${API}/notifications/read`, async ({ request }) => {
    const u = me()
    if (!u) return problem(401, 'Not signed in')
    const ids = (await body<{ ids?: string[] }>(request))?.ids
    const list = getDb().notifications[u.id] ?? []
    list.forEach((n) => {
      if (!ids || ids.includes(n.id)) n.unread = false
    })
    save()
    return ok(list)
  }),
]
