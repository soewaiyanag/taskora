// The /api/v1 contract. The Go API will produce these shapes; until then MSW serves them (src/mocks).

export type Ink = 'ochre' | 'harbour' | 'rosewood' | 'sage' | 'teal'
export type Role = 'Owner' | 'Admin' | 'Member'
export type StatusId = 'todo' | 'doing' | 'review' | 'done'
/** 0 urgent, 1 high, 2 medium, 3 low */
export type Priority = 0 | 1 | 2 | 3
/** Calendar day as YYYY-MM-DD */
export type Day = string

export interface User {
  id: string
  name: string
  email: string
  initials: string
  ink: Ink
}

export interface Member extends User {
  role: Role
  online: boolean
  lastActive: string
}

export interface ListNode {
  id: string
  name: string
  spaceId: string
  folderId: string | null
  /** inclusive date range shown under the list title */
  range: [Day, Day] | null
}
export interface FolderNode {
  id: string
  name: string
  spaceId: string
}
export interface SpaceNode {
  id: string
  name: string
  prefix: string
  nextNumber: number
  taskCount: number
}

export interface Workspace {
  slug: string
  name: string
  demo: boolean
  /** the demo freezes "today" so dates in the sample data stay meaningful */
  today: Day
  updatedAt: Day
  spaces: SpaceNode[]
  folders: FolderNode[]
  lists: ListNode[]
  members: Member[]
}

export interface Session {
  user: User
  workspaces: { slug: string; name: string }[]
}

export interface ChecklistItem {
  text: string
  done: boolean
}

export interface ActivityEntry {
  id: string
  who: string
  text: string
  comment: boolean
  at: string
}

export interface Task {
  code: string
  listId: string
  status: StatusId
  ownerId: string
  priority: Priority
  start: Day
  due: Day
  title: string
  tags: string[]
  description: string
  checklist: ChecklistItem[]
  activity: ActivityEntry[]
  /** order inside its lane; lower comes first */
  position: number
}

export interface MyTask extends Task {
  where: [string, string]
}

export interface Notification {
  id: string
  who: string | null
  taskCode: string
  verb: string
  quote: string | null
  at: string
  unread: boolean
}

export interface NotificationPref {
  id: string
  label: string
  hint: string
  inbox: boolean | null
  email: boolean
}

export interface Invite {
  id: string
  email: string
  role: Exclude<Role, 'Owner'>
  invitedBy: string
  at: string
}

export interface InviteState {
  link: string
  expires: Day
  invites: Invite[]
}

export const STATUSES: { id: StatusId; name: string }[] = [
  { id: 'todo', name: 'To do' },
  { id: 'doing', name: 'In progress' },
  { id: 'review', name: 'In review' },
  { id: 'done', name: 'Done' },
]
export const PRIORITIES = ['Urgent', 'High', 'Medium', 'Low'] as const

export const statusName = (id: StatusId) => STATUSES.find((s) => s.id === id)?.name ?? id
