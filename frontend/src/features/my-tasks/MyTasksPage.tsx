import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ChevronRight, Menu, Plus } from 'lucide-react'
import { queryOptions } from '@tanstack/react-query'
import { api } from '@/api/client'
import { statusName, type MyTask, type StatusId } from '@/api/types'
import { I, PrioGlyph, Rail, StatusGlyph, inkStyle } from '@/components/ui/glyphs'
import { AppShell, useSession } from '@/features/shell/AppShell'
import { TaskDrawer } from '@/features/tasks/TaskDrawer'
import { useMoveTask } from '@/features/board/api'
import { useWorkspace } from '@/features/workspace/api'
import { addDays, diffDays, dueText, longDay, railWindow, shortDate } from '@/lib/dates'
import { keys } from '@/lib/query'
import { toast, useUi } from '@/stores/ui'

const WEEK_DAYS = 7

export const myTasksQuery = (slug: string) =>
  queryOptions({ queryKey: keys.myTasks(slug), queryFn: () => api<MyTask[]>(`/workspaces/${slug}/my-tasks`) })

export interface MyTasksSearch {
  task?: string
  show?: 'done'
}

function Row({ t, today, onOpen }: { t: MyTask; today: string; onOpen: () => void }) {
  const done = t.status === 'done'
  const over = !done && diffDays(t.due, today) < 0
  return (
    <button className={`row${done ? ' done' : ''}`} type="button" style={inkStyle(useSession().user.ink)} onClick={onOpen}>
      <span className="flag" aria-hidden="true" />
      <span className="code">{t.code}</span>
      <span className="body">
        <span className="t">{t.title}</span>
        <span className="where">
          {t.where[0]} <I icon={ChevronRight} /> {t.where[1]}
        </span>
      </span>
      <span className="rail-wrap" title={`${shortDate(t.start)} → ${shortDate(t.due)}`}>
        <Rail start={t.start} due={t.due} today={today} over={over} />
      </span>
      {done ? <span className="prio" /> : <PrioGlyph p={t.priority} />}
      <span className={`due${over ? ' over' : ''}`}>{done ? `Done ${shortDate(t.due)}` : dueText(t.due, today, false)}</span>
      <span className="st">
        <StatusGlyph s={t.status} size={14} />
        {statusName(t.status)}
      </span>
    </button>
  )
}

export function MyTasksPage({ slug, search }: { slug: string; search: MyTasksSearch }) {
  const ws = useWorkspace(slug)
  const { user } = useSession()
  const { data: mine } = useSuspenseQuery(myTasksQuery(slug))
  const navigate = useNavigate()
  const today = ws.today
  const showDone = search.show === 'done'
  const open = mine.filter((t) => t.status !== 'done')
  const done = mine.filter((t) => t.status === 'done')
  const openTask = mine.find((t) => t.code === search.task)
  const moveIn = useMoveTask(openTask?.listId ?? '')
  const win = railWindow(today)
  const weekEnd = addDays(today, WEEK_DAYS)
  const lists = new Set(open.map((t) => t.listId)).size

  const groups: [string, MyTask[], string?][] = showDone
    ? [['Done', done]]
    : [
        ['Overdue', open.filter((t) => diffDays(t.due, today) < 0), 'over'],
        ['Today', open.filter((t) => t.due === today)],
        ['This week', open.filter((t) => diffDays(t.due, today) > 0 && t.due <= weekEnd)],
        ['Later', open.filter((t) => t.due > weekEnd)],
      ]
  const setSearch = (patch: Partial<MyTasksSearch>) =>
    void navigate({ to: '/w/$ws/my-tasks', params: { ws: slug }, search: (s: MyTasksSearch) => ({ ...s, ...patch }) })

  return (
    <AppShell slug={slug} active="my-tasks">
      <main className="main scroll">
        <div className="page">
          <header className="pagehead">
            <div>
              <div className="crumb">
                <button
                  className="icon-btn menu-btn"
                  type="button"
                  aria-label="Open sidebar"
                  onClick={() => useUi.getState().setSidebar(true)}
                >
                  <I icon={Menu} />
                </button>
              </div>
              <h1 className="title">My tasks</h1>
              <p className="sub">
                {open.length} open across {lists} list{lists === 1 ? '' : 's'} · Today is {longDay(today)}
              </p>
            </div>
            <div className="tools">
              <div className="seg" role="group" aria-label="Show">
                <button type="button" aria-pressed={!showDone} onClick={() => setSearch({ show: undefined })}>
                  Open
                </button>
                <button type="button" aria-pressed={showDone} onClick={() => setSearch({ show: 'done' })}>
                  Done
                </button>
              </div>
              <button
                className="btn btn-primary"
                type="button"
                aria-label="New task"
                onClick={() => {
                  const first = ws.lists[0]
                  if (first) {
                    useUi.getState().setComposer('todo')
                    void navigate({ to: '/w/$ws/l/$listId', params: { ws: slug, listId: first.id } })
                  }
                }}
              >
                <I icon={Plus} />
                <span className="btn-label">New task</span>
                <kbd>C</kbd>
              </button>
            </div>
          </header>
          <div className="colhead" aria-hidden="true">
            <span>Task</span>
            <span />
            <span>
              {shortDate(win.start)} – {shortDate(addDays(win.start, win.days)).replace(/^\w+ /, '')}
            </span>
            <span>P</span>
            <span>Due</span>
            <span>Status</span>
          </div>
          {groups.every((g) => g[1].length === 0) ? (
            <p className="empty-state">
              {showDone
                ? 'Nothing done yet. Finished tasks land here.'
                : 'Nothing assigned to you. Tasks you own across every list show up here.'}
            </p>
          ) : (
            <div className="groups">
              {groups
                .filter((g) => g[1].length)
                .map(([name, xs, cls]) => (
                  <section key={name} aria-labelledby={`g-${name}`}>
                    <h2 className="grp-h" id={`g-${name}`}>
                      <span className={cls}>{name}</span>
                      <em>{xs.length}</em>
                    </h2>
                    <div className="rows">
                      {xs.map((t) => (
                        <Row key={t.code} t={t} today={today} onOpen={() => setSearch({ task: t.code })} />
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          )}
        </div>
      </main>
      <TaskDrawer
        ws={ws}
        listId={openTask?.listId ?? null}
        code={search.task ?? null}
        where={openTask ? openTask.where[1] : ''}
        meId={user.id}
        onClose={() => setSearch({ task: undefined })}
        onMove={(code, status: StatusId) => {
          moveIn.mutate({ code, status, beforeCode: null })
          toast(`Moved ${code} to ${statusName(status)}`)
        }}
      />
    </AppShell>
  )
}
