import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, Copy, X } from 'lucide-react'
import { PRIORITIES, STATUSES, type ActivityEntry, type Member, type Priority, type StatusId, type Workspace } from '@/api/types'
import { Avatar, I, PrioGlyph, Select, inkStyle } from '@/components/ui/glyphs'
import { tasksQuery, useComment, useToggleCheck, useUpdateTask } from '@/features/board/api'
import { ago, relDue, shortDate } from '@/lib/dates'
import { EASE_OUT, reduceMotion } from '@/lib/motion'
import { toast } from '@/stores/ui'

const CLOSE_MS = 230
const COPIED_MS = 1200
const CELEBRATE_MS = 900
const drafts = new Map<string, string>()

/** @Name mentions take that teammate's ink, everything else stays plain text */
function Mentions({ text, members }: { text: string; members: Member[] }) {
  const parts = text.split(/(@[A-Za-z]+)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (!p.startsWith('@')) return p
        const m = members.find((x) => x.name.split(' ')[0]?.toLowerCase() === p.slice(1).toLowerCase())
        return (
          <span key={i} className="mention" style={inkStyle(m?.ink)}>
            {p}
          </span>
        )
      })}
    </>
  )
}

function Activity({ a, members, isNew }: { a: ActivityEntry; members: Member[]; isNew: boolean }) {
  const who = members.find((m) => m.id === a.who)
  const name = who?.name ?? 'Someone'
  return a.comment ? (
    <li className={`act${isNew ? ' new' : ''}`}>
      <Avatar ink={who?.ink} initials={who?.initials ?? '?'} size="sm" />
      <div>
        <div className="act-meta">
          <b>{name}</b> <span className="muted">{ago(a.at)}</span>
        </div>
        <p className="bubble">
          <Mentions text={a.text} members={members} />
        </p>
      </div>
    </li>
  ) : (
    <li className={`act${isNew ? ' new' : ''}`}>
      <span className="dot" aria-hidden="true" />
      <p>
        <b>{name}</b> {a.text} <span className="muted">· {ago(a.at)}</span>
      </p>
    </li>
  )
}

interface Props {
  ws: Workspace
  listId: string | null
  code: string | null
  onClose: () => void
  onMove: (code: string, status: StatusId) => void
  where: string
  meId: string
}

/** The task panel slides over the board and never squeezes it. */
export function TaskDrawer({ ws, listId, code, onClose, onMove, where, meId }: Props) {
  const { data: tasks } = useQuery({ ...tasksQuery(listId ?? ''), enabled: !!listId })
  const task = tasks?.find((t) => t.code === code) ?? null
  const [shown, setShown] = useState(code)
  const [open, setOpen] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [justCk, setJustCk] = useState<number | null>(null)
  const [complete, setComplete] = useState(false)
  const [copied, setCopied] = useState(false)
  const [newComment, setNewComment] = useState(false)
  const body = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const update = useUpdateTask(listId ?? '')
  const check = useToggleCheck(listId ?? '')
  const comment = useComment(listId ?? '', meId)
  const [draft, setDraft] = useState('')

  // a new task in the URL resets the panel's local state during render, not in an effect
  const [prevCode, setPrevCode] = useState(code)
  const [switching, setSwitching] = useState(false)
  if (code !== prevCode) {
    setPrevCode(code)
    if (code) {
      setSwitching(shown !== null && shown !== code)
      setShown(code)
      setDraft(drafts.get(code) ?? '')
      setJustCk(null)
      setComplete(false)
    }
  }

  useEffect(() => {
    if (code) {
      requestAnimationFrame(() => setOpen(true))
      if (switching && !reduceMotion())
        body.current?.animate(
          [
            { opacity: 0, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 200, easing: EASE_OUT },
        )
      requestAnimationFrame(() => title.current?.focus({ preventScroll: true }))
      return
    }
    const t0 = requestAnimationFrame(() => setOpen(false))
    const t = window.setTimeout(() => setShown(null), CLOSE_MS)
    return () => {
      cancelAnimationFrame(t0)
      window.clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reacts to the URL's task only
  }, [code])

  const members = ws.members
  const owner = members.find((m) => m.id === task?.ownerId)
  const hidden = !shown

  const copy = () => {
    if (!task) return
    const ok = () => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), COPIED_MS)
      toast(`Copied ${task.code}`)
    }
    const fail = () => toast(`Couldn’t copy. The code is ${task.code}`)
    try {
      navigator.clipboard.writeText(task.code).then(ok, fail)
    } catch {
      fail()
    }
  }

  const nDone = task?.checklist.filter((c) => c.done).length ?? 0
  const all = !!task && task.checklist.length > 0 && nDone === task.checklist.length

  return (
    <aside
      className={`drawer${open && code ? ' open' : ''}${!code && shown ? ' closing' : ''}${celebrate ? ' celebrate' : ''}`}
      aria-label="Task details"
      hidden={hidden}
      style={inkStyle(owner?.ink)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !(e.target as HTMLElement).matches('input, textarea')) {
          e.stopPropagation()
          onClose()
        }
      }}
    >
      <div className="d-head">
        <span className="code">{task?.code ?? shown}</span>
        <span className="muted">{where}</span>
        <span className="spacer" />
        <button className="icon-btn" type="button" aria-label={copied ? 'Copied' : 'Copy task code'} onClick={copy}>
          <I icon={copied ? Check : Copy} />
        </button>
        <button className="icon-btn" type="button" aria-label="Close task" onClick={onClose}>
          <I icon={X} />
        </button>
      </div>
      <div className="d-body" ref={body}>
        {!task ? (
          <p className="d-missing">
            {tasks ? `There’s no task ${shown} in this list. It may have moved or been deleted.` : 'Loading the task…'}
          </p>
        ) : (
          <>
            <h2 className="d-title" tabIndex={-1} ref={title}>
              {task.title}
            </h2>
            <dl className="props">
              <dt>
                <label htmlFor="f-status">Status</label>
              </dt>
              <dd>
                <Select id="f-status" value={task.status} onChange={(e) => onMove(task.code, e.target.value as StatusId)}>
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </dd>
              <dt>
                <label htmlFor="f-owner">Assignee</label>
              </dt>
              <dd>
                {owner && <Avatar ink={owner.ink} initials={owner.initials} size="sm" />}
                <Select id="f-owner" value={task.ownerId} onChange={(e) => update.mutate({ code: task.code, ownerId: e.target.value })}>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </dd>
              <dt>
                <label htmlFor="f-prio">Priority</label>
              </dt>
              <dd>
                <PrioGlyph p={task.priority} />
                <Select
                  id="f-prio"
                  value={task.priority}
                  onChange={(e) => update.mutate({ code: task.code, priority: Number(e.target.value) as Priority })}
                >
                  {PRIORITIES.map((p, i) => (
                    <option key={p} value={i}>
                      {p}
                    </option>
                  ))}
                </Select>
              </dd>
              <dt>Dates</dt>
              <dd>
                {shortDate(task.start)} → {shortDate(task.due)}
                <span className="muted">· {relDue(task.due, ws.today, task.status === 'done')}</span>
              </dd>
              <dt>Tags</dt>
              <dd className="tags">
                {task.tags.length ? (
                  task.tags.map((g) => (
                    <span key={g} className="tag">
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="muted">None</span>
                )}
              </dd>
            </dl>
            <section className="d-sec">
              <h3>Description</h3>
              <p className="desc">{task.description || <span className="muted">No description yet.</span>}</p>
            </section>
            {task.checklist.length > 0 && (
              <section className="d-sec">
                <h3>
                  Checklist{' '}
                  <span className="muted">{all ? `All ${task.checklist.length} done` : `${nDone} of ${task.checklist.length} done`}</span>
                </h3>
                <div className={`segs${complete ? ' complete' : ''}`} aria-hidden="true">
                  {task.checklist.map((c, i) => (
                    <span
                      key={i}
                      className={`${c.done ? 'on' : ''}${justCk === i && c.done && !complete ? ' just' : ''}`}
                      style={{ '--i': i } as React.CSSProperties}
                    />
                  ))}
                </div>
                <ul className="checklist">
                  {task.checklist.map((c, i) => (
                    <li key={i} className={justCk === i ? 'just' : undefined}>
                      <input
                        type="checkbox"
                        id={`ck-${i}`}
                        checked={c.done}
                        onChange={(e) => {
                          const done = e.target.checked
                          const finished = done && task.checklist.every((k, j) => j === i || k.done)
                          setJustCk(i)
                          setComplete(finished)
                          if (finished) {
                            setCelebrate(false)
                            requestAnimationFrame(() => setCelebrate(true))
                            window.setTimeout(() => setCelebrate(false), CELEBRATE_MS)
                            toast(`Checklist complete on ${task.code}`)
                          }
                          check.mutate({ code: task.code, index: i, done })
                        }}
                      />
                      <span className="box" aria-hidden="true">
                        <svg viewBox="0 0 16 16">
                          <path d="m3.5 8.5 3 3 6-7" />
                        </svg>
                      </span>
                      <label htmlFor={`ck-${i}`}>{c.text}</label>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className="d-sec">
              <h3>Activity</h3>
              <ol className="activity">
                {task.activity.map((a, i) => (
                  <Activity key={a.id} a={a} members={members} isNew={newComment && i === task.activity.length - 1} />
                ))}
              </ol>
              <form
                className="comment-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  const text = draft.trim()
                  if (!text) return
                  setNewComment(true)
                  comment.mutate(
                    { code: task.code, text },
                    {
                      onSuccess: () => {
                        drafts.delete(task.code)
                        setDraft((d) => (d.trim() === text ? '' : d))
                      },
                    },
                  )
                }}
              >
                <label className="sr" htmlFor="comment">
                  Write a comment
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  maxLength={2000}
                  placeholder="Comment, or @mention someone"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value)
                    drafts.set(task.code, e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      e.currentTarget.form?.requestSubmit()
                    }
                  }}
                />
                <div className="cf-foot">
                  <span className="muted">
                    <kbd>⌘</kbd> <kbd>↵</kbd> to send
                  </span>
                  <button className="btn btn-primary sm" type="submit" disabled={!draft.trim()}>
                    Comment
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </div>
    </aside>
  )
}
