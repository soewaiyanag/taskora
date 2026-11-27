import { useEffect, useMemo, useRef } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ChevronRight, ListFilter, Menu, Plus } from 'lucide-react'
import type { StatusId } from '@/api/types'
import { Avatar, I } from '@/components/ui/glyphs'
import { AppShell, useSession } from '@/features/shell/AppShell'
import type { PaletteGroup } from '@/features/search/CommandPalette'
import { TaskDrawer } from '@/features/tasks/TaskDrawer'
import { useWorkspace } from '@/features/workspace/api'
import { longDay, shortDate } from '@/lib/dates'
import { FLIGHT_MS, reduceMotion } from '@/lib/motion'
import { toast, useUi } from '@/stores/ui'
import { tasksQuery } from './api'
import { Board, type BoardApi } from './Board'

const REVEAL_GAP = 24
const MIN_BOARD_BESIDE_DRAWER = 200
const UNFREEZE_MS = 450
const MAX_LENS_KEYS = 9

export interface BoardSearch {
  task?: string
  lens?: string
}

export function BoardPage({ slug, listId, search }: { slug: string; listId: string; search: BoardSearch }) {
  const ws = useWorkspace(slug)
  const { user } = useSession()
  const { data: tasks } = useSuspenseQuery(tasksQuery(listId))
  const navigate = useNavigate()
  const boardRef = useRef<HTMLDivElement>(null)
  const boardApi = useRef<BoardApi | null>(null)
  const hoverLens = useUi((s) => s.hoverLens)
  const setHoverLens = useUi((s) => s.setHoverLens)
  const setComposer = useUi((s) => s.setComposer)
  const tourDone = useUi((s) => s.tourDone)
  const list = ws.lists.find((l) => l.id === listId)!
  const space = ws.spaces.find((s) => s.id === list.spaceId)
  const folder = ws.folders.find((f) => f.id === list.folderId)
  const pinned = ws.members.find((m) => m.initials === search.lens?.toUpperCase()) ?? null
  const lensId = pinned?.id ?? hoverLens
  const lensPerson = ws.members.find((m) => m.id === lensId)
  const online = ws.members.filter((m) => m.online)
  const selected = search.task ?? null

  const setSearch = (patch: Partial<BoardSearch>) =>
    void navigate({ to: '/w/$ws/l/$listId', params: { ws: slug, listId }, search: (s: BoardSearch) => ({ ...s, ...patch }), replace: true })
  const pinLens = (id: string | null) => {
    const m = ws.members.find((x) => x.id === id)
    setSearch({ lens: m ? m.initials : undefined })
    if (m) tourDone('lens')
  }
  const togglePin = (id: string) => (pinned?.id === id ? pinLens(null) : pinLens(id))
  const openTask = (code: string) => {
    void navigate({ to: '/w/$ws/l/$listId', params: { ws: slug, listId }, search: (s: BoardSearch) => ({ ...s, task: code }) })
    tourDone('open')
  }
  const closeTask = () => {
    const code = selected
    setSearch({ task: undefined })
    if (code)
      requestAnimationFrame(() =>
        boardRef.current?.querySelector<HTMLElement>(`.card[data-code="${code}"]`)?.focus({ preventScroll: true }),
      )
  }

  // keep the open card visible beside the drawer: freeze lane widths, add room on the right, scroll it in
  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    if (!selected) {
      if (!board.dataset.frozen) return
      board.scrollTo({ left: 0, behavior: reduceMotion() ? 'auto' : 'smooth' })
      const t = window.setTimeout(() => {
        delete board.dataset.frozen
        board.style.gridAutoColumns = ''
        board.style.paddingRight = ''
      }, UNFREEZE_MS)
      return () => window.clearTimeout(t)
    }
    const reveal = () => {
      const c = board.querySelector<HTMLElement>(`.card[data-code="${selected}"]`)
      const drawer = document.querySelector<HTMLElement>('.drawer')
      if (!c || !drawer) return
      const dw = drawer.getBoundingClientRect().width
      if (dw > innerWidth - MIN_BOARD_BESIDE_DRAWER) return
      if (!board.dataset.frozen) {
        board.dataset.frozen = '1'
        board.style.gridAutoColumns = `${board.querySelector('.lane')!.getBoundingClientRect().width}px`
        board.style.paddingRight = `${dw + REVEAL_GAP}px`
      }
      const limit = innerWidth - dw - REVEAL_GAP
      const r = c.getBoundingClientRect()
      if (r.right > limit) board.scrollBy({ left: r.right - limit, behavior: reduceMotion() ? 'auto' : 'smooth' })
    }
    const t = window.setTimeout(reveal, 0)
    const t2 = window.setTimeout(reveal, FLIGHT_MS) // again after a move lands
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(t2)
    }
  }, [selected, tasks])

  // board keys: C new task, 1–5 lens, 0 clear, ⌘Z undo, Escape peels back one layer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const st = useUi.getState()
      if (st.paletteOpen || st.inboxOpen) return
      const typing = (e.target as HTMLElement).matches?.('input, textarea, select')
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !typing && st.lastUndo) {
        e.preventDefault()
        st.lastUndo()
        st.hideToast()
        return
      }
      if (e.key === 'Escape') {
        if (st.composer) st.setComposer(null)
        else if (selected) closeTask()
        else if (!st.sidebarOpen && search.lens) pinLens(null)
        return
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.toLowerCase() === 'c' && !selected) {
        e.preventDefault()
        setComposer('todo')
      } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= Math.min(MAX_LENS_KEYS, ws.members.length)) {
        togglePin(ws.members[Number(e.key) - 1]!.id)
      } else if (e.key === '0') pinLens(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const lensGroup = useMemo<PaletteGroup[]>(
    () => [
      {
        name: 'Show someone’s work',
        items: ws.members.map((m, i) => ({ label: m.name, kbd: String(i + 1), ink: m.ink, run: () => pinLens(m.id) })),
      },
      {
        name: 'On this board',
        items: [
          { label: 'New task in To do', kbd: 'C', run: () => setComposer('todo') },
          { label: 'Clear the lens', kbd: '0', run: () => pinLens(null) },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- navigation helpers are stable enough for a palette
    [ws.members, listId],
  )

  const openCount = lensPerson ? tasks.filter((t) => t.ownerId === lensPerson.id && t.status !== 'done').length : 0
  const range = list.range ? `${shortDate(list.range[0])} – ${shortDate(list.range[1])} · ` : ''

  return (
    <AppShell slug={slug} active={{ list: listId }} extraGroups={lensGroup}>
      <main className="main">
        <header className="top">
          <div>
            <div className="crumb">
              <button
                className="icon-btn menu-btn"
                type="button"
                aria-label="Open sidebar"
                aria-controls="side"
                onClick={() => useUi.getState().setSidebar(true)}
              >
                <I icon={Menu} />
              </button>
              {space?.name}
              {folder && (
                <>
                  <I icon={ChevronRight} /> {folder.name}
                </>
              )}
            </div>
            <h1 className="title">{list.name}</h1>
            <p className="sub">
              {range}
              {tasks.length} task{tasks.length === 1 ? '' : 's'} · Today is {longDay(ws.today)}
            </p>
          </div>
          <div className="tools">
            {ws.members.length > 1 && (
              <div className="people" role="group" aria-label="Show a teammate’s work">
                <span className="people-note" aria-live="polite">
                  {lensPerson ? (
                    <>
                      <b>{lensPerson.name}</b> · {openCount} open
                    </>
                  ) : (
                    `${online.length} online · hover a teammate`
                  )}
                </span>
                <span
                  className="people-list"
                  onPointerLeave={() => !pinned && setHoverLens(null)}
                  onBlur={() => !pinned && setHoverLens(null)}
                >
                  {ws.members.map((m, i) => (
                    <button
                      key={m.id}
                      className={`person${lensId === m.id ? ' on' : ''}`}
                      type="button"
                      style={{ '--ink': `var(--o-${m.ink})` } as React.CSSProperties}
                      aria-pressed={pinned?.id === m.id}
                      aria-label={`${m.initials}: show ${m.name}’s work (${i + 1})${m.online ? ', online now' : ''}`}
                      title={`${m.name}${m.online ? ' · online' : ''} · press ${i + 1}`}
                      onPointerOver={() => {
                        if (!pinned) {
                          setHoverLens(m.id)
                          tourDone('lens')
                        }
                      }}
                      onFocus={() => !pinned && setHoverLens(m.id)}
                      onClick={() => {
                        setHoverLens(null)
                        togglePin(m.id)
                      }}
                    >
                      <Avatar ink={m.ink} initials={m.initials} size="lg" />
                      {m.online && <span className="online" aria-hidden="true" />}
                    </button>
                  ))}
                </span>
              </div>
            )}
            <button className="btn filter-btn" type="button" onClick={() => toast(`Filters and saved views are coming soon.`)}>
              <I icon={ListFilter} />
              Filter
              <span className="soon">Soon</span>
            </button>
            <button className="btn btn-primary" type="button" aria-label="New task" onClick={() => setComposer('todo')}>
              <I icon={Plus} />
              <span className="btn-label">New task</span>
              <kbd>C</kbd>
            </button>
          </div>
        </header>
        <Board
          ws={ws}
          listId={listId}
          tasks={tasks}
          lens={lensId}
          selected={selected}
          onOpen={openTask}
          boardRef={boardRef}
          apiRef={boardApi}
        />
      </main>
      <TaskDrawer
        ws={ws}
        listId={listId}
        code={selected}
        where={list.name}
        meId={user.id}
        onClose={closeTask}
        onMove={(code, status: StatusId) => {
          boardApi.current?.move(code, status)
          requestAnimationFrame(() => document.getElementById('f-status')?.focus())
        }}
      />
    </AppShell>
  )
}
