import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQueries, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronRight, Folder, Inbox as InboxIcon, List, CircleCheck, Moon, Search, Settings, Sun } from 'lucide-react'
import type { Session, Task, Workspace } from '@/api/types'
import { Avatar, I, Mark } from '@/components/ui/glyphs'
import { meQuery } from '@/features/auth/api'
import { tasksQuery } from '@/features/board/api'
import { Inbox } from '@/features/inbox/Inbox'
import { notificationsQuery } from '@/features/inbox/api'
import { CommandPalette, type PaletteGroup } from '@/features/search/CommandPalette'
import { useWorkspace } from '@/features/workspace/api'
import { useShallow } from 'zustand/react/shallow'
import { isDark, useUi } from '@/stores/ui'
import { Tour } from './Tour'

export type Active = { list: string } | 'my-tasks'

const TASKS_IN_PALETTE = 6

export function useSession(): Session {
  const s = useSuspenseQuery(meQuery).data
  if (!s) throw new Error('useSession outside a signed-in route')
  return s
}

/** every task in the workspace, for the palette, the Inbox and My tasks counts */
export function useAllTasks(ws: Workspace): Task[] {
  return useQueries({
    queries: ws.lists.map((l) => tasksQuery(l.id)),
    combine: (rs) => rs.flatMap((r) => r.data ?? []),
  })
}

export function AppShell({
  slug,
  active,
  children,
  extraGroups = [],
}: {
  slug: string
  active: Active
  children: ReactNode
  extraGroups?: PaletteGroup[]
}) {
  const ws = useWorkspace(slug)
  const { user } = useSession()
  const all = useAllTasks(ws)
  const navigate = useNavigate()
  const ui = useUi(
    useShallow((s) => ({
      sidebarOpen: s.sidebarOpen,
      inboxOpen: s.inboxOpen,
      lastUndo: s.lastUndo,
      theme: s.theme,
      setSidebar: s.setSidebar,
      setPalette: s.setPalette,
      setInbox: s.setInbox,
      setTheme: s.setTheme,
      tourDone: s.tourDone,
    })),
  )
  const inboxBtn = useRef<HTMLButtonElement>(null)
  const { data: notes = [] } = useQuery(notificationsQuery)
  const unread = notes.filter((n) => n.unread).length
  const openMine = all.filter((t) => t.ownerId === user.id && t.status !== 'done').length
  const [closed, setClosed] = useState<Set<string>>(new Set())
  const [badgeBump, setBadgeBump] = useState(0)
  const lastUnread = useRef(unread)

  useEffect(() => {
    if (unread !== lastUnread.current) setBadgeBump((n) => n + 1)
    lastUnread.current = unread
  }, [unread])

  // ⌘K and / open the palette anywhere; Escape closes the shell's own layers (pages handle theirs first)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).matches?.('input, textarea, select')
      const st = useUi.getState()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        st.setPalette(!st.paletteOpen)
        if (!st.paletteOpen) st.tourDone('palette')
        return
      }
      if (st.paletteOpen) return
      if (e.key === 'Escape') {
        if (st.inboxOpen) {
          st.setInbox(false)
          inboxBtn.current?.focus()
        } else if (st.sidebarOpen) st.setSidebar(false)
        return
      }
      if (!typing && e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        st.setPalette(true)
        st.tourDone('palette')
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const toggle = (id: string) =>
    setClosed((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  const closeSide = () => ui.setSidebar(false)
  const listLink = (id: string, name: string) => (
    <Link
      key={id}
      className="nav-item"
      to="/w/$ws/l/$listId"
      params={{ ws: slug, listId: id }}
      aria-current={typeof active === 'object' && active.list === id ? 'page' : undefined}
      onClick={closeSide}
    >
      <I icon={List} />
      <span className="label">{name}</span>
    </Link>
  )

  const groups = useMemo<PaletteGroup[]>(() => {
    const listName = (id: string) => ws.lists.find((l) => l.id === id)?.name ?? ''
    const person = (id: string) => ws.members.find((m) => m.id === id)
    return [
      {
        name: 'Tasks',
        limit: TASKS_IN_PALETTE,
        items: all.map((t) => ({
          label: t.title,
          code: t.code,
          keywords: `${person(t.ownerId)?.name ?? ''} ${listName(t.listId)}`,
          ink: person(t.ownerId)?.ink,
          run: () => void navigate({ to: '/w/$ws/l/$listId', params: { ws: slug, listId: t.listId }, search: { task: t.code } }),
        })),
      },
      ...extraGroups,
      {
        name: 'Go to',
        items: [
          { label: 'My tasks', run: () => void navigate({ to: '/w/$ws/my-tasks', params: { ws: slug } }) },
          ...ws.lists.map((l) => ({
            label: l.name,
            keywords: 'list board',
            run: () => void navigate({ to: '/w/$ws/l/$listId', params: { ws: slug, listId: l.id } }),
          })),
          {
            label: 'Settings',
            keywords: 'profile notifications members',
            run: () => void navigate({ to: '/w/$ws/settings/profile', params: { ws: slug } }),
          },
        ],
      },
      {
        name: 'Actions',
        items: [
          { label: 'Open Inbox', run: () => ui.setInbox(true) },
          ...(ui.lastUndo ? [{ label: 'Undo the last move', kbd: '⌘Z', run: () => useUi.getState().lastUndo?.() }] : []),
          { label: 'Switch between light and dark', run: () => ui.setTheme(isDark(useUi.getState().theme) ? 'light' : 'dark') },
        ],
      },
    ]
  }, [all, ws, slug, navigate, extraGroups, ui])

  const spaceLists = (spaceId: string) => ws.lists.filter((l) => l.spaceId === spaceId && !l.folderId)
  const dark = isDark(ui.theme)

  return (
    <div className="app">
      <nav className={`side${ui.sidebarOpen ? ' open' : ''}`} id="side" aria-label="Workspace">
        <div className="ws">
          <Mark flag={user.ink} />
          <span>
            <span className="ws-name">{ws.name}</span>
            <span className="ws-sub">
              {ws.members.length} member{ws.members.length === 1 ? '' : 's'}
            </span>
          </span>
          {ws.demo && (
            <span className="chip-demo" title={`Sample workspace: the people, tasks and today’s date are made up.`}>
              Demo
            </span>
          )}
        </div>
        <button
          className="search-btn"
          type="button"
          onClick={() => {
            closeSide()
            ui.setPalette(true)
            ui.tourDone('palette')
          }}
        >
          <I icon={Search} />
          <span>Search or jump to</span>
          <kbd>⌘K</kbd>
        </button>
        <button
          ref={inboxBtn}
          className="nav-item"
          type="button"
          aria-expanded={ui.inboxOpen}
          aria-controls="inbox"
          onClick={() => {
            closeSide()
            ui.setInbox(!ui.inboxOpen)
          }}
        >
          <I icon={InboxIcon} />
          Inbox
          {unread > 0 && (
            <span key={badgeBump} className={`badge${badgeBump ? ' bump' : ''}`} aria-label={`${unread} unread`}>
              {unread}
            </span>
          )}
        </button>
        <Link
          className="nav-item"
          to="/w/$ws/my-tasks"
          params={{ ws: slug }}
          aria-current={active === 'my-tasks' ? 'page' : undefined}
          onClick={closeSide}
        >
          <I icon={CircleCheck} />
          My tasks
          {openMine > 0 && <span className="n">{openMine}</span>}
        </Link>
        <div className="group-label" id="spaces-label">
          Spaces
        </div>
        <div className="tree" role="group" aria-labelledby="spaces-label">
          {ws.spaces.map((s) => (
            <div key={s.id} className="tree">
              <button className="nav-item" type="button" aria-expanded={!closed.has(s.id)} onClick={() => toggle(s.id)}>
                <span className="space-mark">{s.name[0]}</span>
                <span className="label">{s.name}</span>
                <I icon={ChevronRight} className="i chev" />
              </button>
              <div className="kids" hidden={closed.has(s.id)}>
                {ws.folders
                  .filter((f) => f.spaceId === s.id)
                  .map((f) => (
                    <div key={f.id} className="tree">
                      <button className="nav-item" type="button" aria-expanded={!closed.has(f.id)} onClick={() => toggle(f.id)}>
                        <I icon={Folder} />
                        <span className="label">{f.name}</span>
                        <I icon={ChevronRight} className="i chev" />
                      </button>
                      <div className="kids" hidden={closed.has(f.id)}>
                        {ws.lists.filter((l) => l.folderId === f.id).map((l) => listLink(l.id, l.name))}
                      </div>
                    </div>
                  ))}
                {spaceLists(s.id).map((l) => listLink(l.id, l.name))}
              </div>
            </div>
          ))}
        </div>
        <div className="side-foot">
          {ws.demo && <Tour />}
          <Link className="nav-item" to="/w/$ws/settings/profile" params={{ ws: slug }} onClick={closeSide}>
            <I icon={Settings} />
            Settings
          </Link>
          <div className="me">
            <Avatar ink={user.ink} initials={user.initials} />
            <span className="who">{user.name}</span>
            <button
              className="icon-btn"
              type="button"
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={() => ui.setTheme(dark ? 'light' : 'dark')}
            >
              <I icon={dark ? Sun : Moon} />
            </button>
          </div>
        </div>
      </nav>
      <div className={`side-scrim${ui.sidebarOpen ? ' open' : ''}`} onClick={closeSide} />
      {children}
      <Inbox ws={ws} tasks={all} anchor={inboxBtn} />
      <CommandPalette groups={groups} />
    </div>
  )
}
