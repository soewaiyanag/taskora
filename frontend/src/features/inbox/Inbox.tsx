import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CircleCheck } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import type { Task, Workspace } from '@/api/types'
import { Avatar, I } from '@/components/ui/glyphs'
import { agoShort } from '@/lib/dates'
import { useUi } from '@/stores/ui'
import { notificationsQuery, useMarkRead } from './api'

const DESKTOP_MIN = 880

export function Inbox({ ws, tasks, anchor }: { ws: Workspace; tasks: Task[]; anchor: React.RefObject<HTMLButtonElement | null> }) {
  const open = useUi((s) => s.inboxOpen)
  const setOpen = useUi((s) => s.setInbox)
  const { data: notes = [] } = useQuery(notificationsQuery)
  const markRead = useMarkRead()
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    ref.current?.focus()
    const away = (e: MouseEvent) => {
      const t = e.target as Node
      if (!ref.current?.contains(t) && !anchor.current?.contains(t)) setOpen(false)
    }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [open, anchor, setOpen])

  if (!open) return null
  const r = anchor.current?.getBoundingClientRect()
  const top = r && innerWidth > DESKTOP_MIN ? Math.max(16, r.top - 8) : undefined
  const unread = notes.some((n) => n.unread)

  const person = (id: string | null) => ws.members.find((m) => m.id === id)

  return (
    <div className="inbox" id="inbox" role="dialog" aria-label="Inbox" tabIndex={-1} ref={ref} style={top ? { top } : undefined}>
      <header>
        <h2>Inbox</h2>
        {unread && (
          <button type="button" className="link" onClick={() => markRead.mutate(undefined)}>
            Mark all read
          </button>
        )}
      </header>
      {notes.length === 0 ? (
        <p className="inbox-empty">You’re all caught up. Mentions, assignments and due dates land here.</p>
      ) : (
        <ul>
          {notes.map((n) => {
            const t = tasks.find((x) => x.code === n.taskCode)
            const who = person(n.who)
            const task = (
              <>
                <span className="code">{n.taskCode}</span>
                {t?.title}
              </>
            )
            return (
              <li key={n.id}>
                <button
                  type="button"
                  className={`note${n.unread ? '' : ' read'}`}
                  onClick={() => {
                    if (n.unread) markRead.mutate([n.id])
                    setOpen(false)
                    if (t) void navigate({ to: '/w/$ws/l/$listId', params: { ws: ws.slug, listId: t.listId }, search: { task: t.code } })
                  }}
                >
                  {who ? (
                    <Avatar ink={who.ink} initials={who.initials} size="sm" />
                  ) : (
                    <span className="note-ic">
                      <I icon={CircleCheck} />
                    </span>
                  )}
                  <span>
                    {who ? (
                      <>
                        <b>{who.name}</b> {n.verb} {task}
                      </>
                    ) : (
                      <>
                        {task} {n.verb}
                      </>
                    )}
                    {n.quote && <q>“{n.quote}”</q>}
                  </span>
                  <span className="when">{agoShort(n.at)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
