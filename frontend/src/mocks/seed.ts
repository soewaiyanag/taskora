// Northwind Studio: the sample workspace from design/prototype. People, tasks and "today" (Sun Nov 15) are made up.
import type {
  ActivityEntry,
  ChecklistItem,
  Ink,
  InviteState,
  Notification,
  NotificationPref,
  Priority,
  Role,
  StatusId,
  Task,
  Workspace,
} from '@/api/types'

export interface DbUser {
  id: string
  name: string
  email: string
  password: string
  ink: Ink
  online: boolean
  lastActive: string
}

export interface Db {
  version: number
  users: DbUser[]
  workspaces: (Omit<Workspace, 'members'> & { members: { userId: string; role: Role }[] })[]
  tasks: Task[]
  notifications: Record<string, Notification[]>
  prefs: Record<string, NotificationPref[]>
  invites: Record<string, InviteState>
}

export const DB_VERSION = 1
export const DEMO_SLUG = 'northwind'
export const DEMO_EMAIL = 'mai@northwind.example'
export const DEMO_PASSWORD = 'northwind-demo'

const nov = (d: number) => `2026-11-${String(d).padStart(2, '0')}`
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()
let seq = 0
const aid = () => `a${++seq}`

function task(
  code: string,
  listId: string,
  status: StatusId,
  ownerId: string,
  priority: Priority,
  start: number,
  due: number,
  title: string,
  tags: string[] = [],
  check: [string, boolean?][] = [],
  description = '',
): Task {
  const checklist: ChecklistItem[] = check.map(([text, done]) => ({ text, done: !!done }))
  const activity: ActivityEntry[] = [{ id: aid(), who: 'jw', text: 'created this task', comment: false, at: `${nov(start)}T09:00:00.000Z` }]
  return {
    code,
    listId,
    status,
    ownerId,
    priority,
    start: nov(start),
    due: nov(due),
    title,
    tags,
    description,
    checklist,
    activity,
    position: 0,
  }
}

export function defaultPrefs(): NotificationPref[] {
  return [
    { id: 'mention', label: 'Someone @mentions me', hint: 'In a comment or a task description.', inbox: true, email: true },
    { id: 'assign', label: 'A task is assigned to me', hint: 'Including tasks I’m added to as an owner.', inbox: true, email: true },
    { id: 'status', label: 'A task I own changes status', hint: 'When a teammate moves it on the board.', inbox: true, email: false },
    { id: 'comment', label: 'Someone comments on my task', hint: 'Replies on tasks I own.', inbox: true, email: false },
    { id: 'due', label: 'A task I own is due tomorrow', hint: 'Sent the evening before.', inbox: false, email: true },
    {
      id: 'digest',
      label: 'Daily summary',
      hint: 'One email at 8:00 with what’s due today and what changed overnight.',
      inbox: null,
      email: false,
    },
  ]
}

export function seed(): Db {
  seq = 0
  const tasks: Task[] = [
    task('WEB-149', 'sprint-14', 'todo', 'pn', 2, 14, 19, 'Audit colour contrast on the pricing page', ['a11y']),
    task('WEB-155', 'sprint-14', 'todo', 'jw', 2, 16, 20, 'Spike: cursor pagination for the activity feed', ['backend']),
    task(
      'WEB-151',
      'sprint-14',
      'todo',
      'so',
      3,
      16,
      21,
      'Write empty-state copy for Inbox',
      ['copy'],
      [['Inbox is empty'], ['No tasks assigned'], ['Search has no results']],
    ),
    task('WEB-150', 'sprint-14', 'todo', 'mt', 3, 17, 22, 'Draft release notes for v0.3', ['docs']),
    task(
      'WEB-153',
      'sprint-14',
      'todo',
      'da',
      3,
      18,
      22,
      'Add Open Graph images to blog posts',
      [],
      [['Image template'], ['Generate on publish']],
    ),
    task(
      'WEB-142',
      'sprint-14',
      'doing',
      'mt',
      1,
      12,
      18,
      'Redesign the onboarding checklist',
      ['design', 'onboarding'],
      [
        ['Create the first space', true],
        ['Invite a teammate', true],
        ['Add a task', true],
        ['Try the ⌘K palette'],
        ['Drag a task to Done'],
      ],
      'New workspaces get a five-step checklist that teaches spaces, lists and the ⌘K palette. Steps tick themselves off as people do them, and the checklist hides once all five are done.',
    ),
    task(
      'WEB-138',
      'sprint-14',
      'doing',
      'jw',
      0,
      10,
      14,
      'Rate-limit the login endpoint',
      ['backend', 'security'],
      [['Token bucket per IP and email', true], ['Return 429 with Retry-After']],
      'Five attempts per minute per IP and per email address. Over the limit, answer 429 with a Retry-After header and log the event.',
    ),
    task(
      'WEB-146',
      'sprint-14',
      'doing',
      'da',
      2,
      13,
      20,
      'Move avatars to S3 presigned uploads',
      ['backend'],
      [['Presign endpoint', true], ['Upload from the browser', true], ['Resize on upload'], ['Delete old files']],
    ),
    task('WEB-147', 'sprint-14', 'doing', 'so', 3, 15, 21, 'Keyboard shortcuts cheat sheet', ['docs']),
    task(
      'WEB-136',
      'sprint-14',
      'review',
      'pn',
      1,
      9,
      17,
      'Fuzzy search in the command palette',
      ['frontend'],
      [
        ['Rank by code, then title', true],
        ['Highlight matches', true],
        ['Recent items first', true],
        ['Empty state', true],
      ],
    ),
    task('WEB-140', 'sprint-14', 'review', 'mt', 2, 11, 18, 'Notification toggles on the Settings page', ['frontend']),
    task('WEB-131', 'sprint-14', 'done', 'jw', 2, 5, 12, 'Invite teammates by link'),
    task('WEB-129', 'sprint-14', 'done', 'mt', 2, 4, 11, 'Workspace switcher'),
    task('WEB-127', 'sprint-14', 'done', 'da', 1, 3, 10, 'Sign up with email verification'),
    task('WEB-124', 'sprint-14', 'done', 'pn', 2, 2, 9, 'Drag tasks between statuses'),
    task('WEB-122', 'sprint-14', 'done', 'so', 3, 2, 8, 'Seed the demo workspace'),

    task('WEB-159', 'backlog', 'todo', 'jw', 2, 19, 26, 'Bulk edit tasks from a selection', ['frontend']),
    task('WEB-158', 'backlog', 'todo', 'so', 3, 20, 27, 'Dark mode for notification emails', ['design']),
    task('WEB-161', 'backlog', 'todo', 'mt', 3, 24, 28, 'Plan the v0.4 roadmap session', ['planning']),

    task('MKT-30', 'launch-campaign', 'todo', 'da', 3, 16, 24, 'Write the launch blog post', ['copy']),
    task('MKT-29', 'launch-campaign', 'doing', 'pn', 2, 12, 19, 'Shoot product screenshots', ['design']),
    task('MKT-31', 'launch-campaign', 'review', 'mt', 1, 9, 13, 'Approve the launch email copy', ['copy']),
    task('MKT-27', 'launch-campaign', 'done', 'mt', 2, 6, 10, 'Pick the launch date'),
    task('MKT-28', 'launch-campaign', 'done', 'so', 3, 5, 9, 'Book the launch webinar'),

    task('OPS-12', 'on-call-rota', 'todo', 'mt', 0, 14, 15, 'Swap on-call with Diego for Thursday'),
    task('OPS-11', 'on-call-rota', 'doing', 'da', 2, 10, 20, 'Rotate the database credentials', ['security']),
    task('OPS-10', 'on-call-rota', 'done', 'jw', 2, 3, 8, 'Set up uptime alerts'),
  ]
  // positions follow seed order inside each list and status
  const counters = new Map<string, number>()
  for (const t of tasks) {
    const k = `${t.listId}:${t.status}`
    const n = counters.get(k) ?? 0
    t.position = n
    counters.set(k, n + 1)
  }
  const byCode = (c: string) => tasks.find((t) => t.code === c)!
  byCode('WEB-142').activity.push(
    { id: aid(), who: 'mt', text: 'checked “Add a task”', comment: false, at: hoursAgo(3) },
    { id: aid(), who: 'jw', text: 'moved this to In progress', comment: false, at: hoursAgo(2) },
    { id: aid(), who: 'pn', text: 'Can step 4 open the palette directly? @Mai', comment: true, at: hoursAgo(0.24) },
  )
  byCode('WEB-138').activity.push({
    id: aid(),
    who: 'pn',
    text: 'This is past due. @Jonas do you need a hand with the Retry-After header?',
    comment: true,
    at: hoursAgo(1),
  })
  byCode('WEB-136').activity.push({
    id: aid(),
    who: 'mt',
    text: 'Works well with codes like web-14. Approving after one more pass on the empty state.',
    comment: true,
    at: hoursAgo(26),
  })

  return {
    version: DB_VERSION,
    users: [
      { id: 'mt', name: 'Mai Tran', email: DEMO_EMAIL, password: DEMO_PASSWORD, ink: 'ochre', online: true, lastActive: 'Online' },
      {
        id: 'jw',
        name: 'Jonas Weber',
        email: 'jonas@northwind.example',
        password: DEMO_PASSWORD,
        ink: 'harbour',
        online: true,
        lastActive: 'Online',
      },
      {
        id: 'pn',
        name: 'Priya Nair',
        email: 'priya@northwind.example',
        password: DEMO_PASSWORD,
        ink: 'rosewood',
        online: true,
        lastActive: 'Online',
      },
      {
        id: 'da',
        name: 'Diego Alvarez',
        email: 'diego@northwind.example',
        password: DEMO_PASSWORD,
        ink: 'sage',
        online: false,
        lastActive: '2h ago',
      },
      {
        id: 'so',
        name: 'Sam Okafor',
        email: 'sam@northwind.example',
        password: DEMO_PASSWORD,
        ink: 'teal',
        online: false,
        lastActive: 'Yesterday',
      },
    ],
    workspaces: [
      {
        slug: DEMO_SLUG,
        name: 'Northwind Studio',
        demo: true,
        today: nov(15),
        updatedAt: nov(14),
        spaces: [
          { id: 'product', name: 'Product', prefix: 'WEB', nextNumber: 162, taskCount: 0 },
          { id: 'marketing', name: 'Marketing', prefix: 'MKT', nextNumber: 32, taskCount: 0 },
          { id: 'ops', name: 'Ops', prefix: 'OPS', nextNumber: 13, taskCount: 0 },
        ],
        folders: [{ id: 'website-relaunch', name: 'Website relaunch', spaceId: 'product' }],
        lists: [
          { id: 'sprint-14', name: 'Sprint 14', spaceId: 'product', folderId: 'website-relaunch', range: [nov(9), nov(22)] },
          { id: 'backlog', name: 'Backlog', spaceId: 'product', folderId: 'website-relaunch', range: null },
          { id: 'launch-campaign', name: 'Launch campaign', spaceId: 'marketing', folderId: null, range: [nov(2), nov(28)] },
          { id: 'on-call-rota', name: 'On-call rota', spaceId: 'ops', folderId: null, range: null },
        ],
        members: [
          { userId: 'mt', role: 'Owner' },
          { userId: 'jw', role: 'Admin' },
          { userId: 'pn', role: 'Member' },
          { userId: 'da', role: 'Member' },
          { userId: 'so', role: 'Member' },
        ],
      },
    ],
    tasks,
    notifications: {
      mt: [
        {
          id: 'n1',
          who: 'pn',
          taskCode: 'WEB-142',
          verb: 'mentioned you on',
          quote: 'Can step 4 open the palette directly?',
          at: hoursAgo(0.24),
          unread: true,
        },
        { id: 'n2', who: 'jw', taskCode: 'WEB-150', verb: 'assigned you', quote: null, at: hoursAgo(1), unread: true },
        { id: 'n3', who: null, taskCode: 'WEB-140', verb: 'is due in 3 days', quote: null, at: hoursAgo(4), unread: true },
      ],
    },
    prefs: {},
    invites: {
      [DEMO_SLUG]: {
        link: 'taskora.app/join/northwind/k7Qm2xP9',
        expires: nov(22),
        invites: [{ id: 'i1', email: 'alex@northwind.example', role: 'Member', invitedBy: 'mt', at: hoursAgo(48) }],
      },
    },
  }
}
