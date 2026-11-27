import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { STATUSES, statusName, type Member, type StatusId, type Task, type Workspace } from '@/api/types'
import { I, StatusGlyph } from '@/components/ui/glyphs'
import { FLIGHT_MS, EASE_OUT, GLIDE_MS, REMOTE_HOLD_MS, reduceMotion } from '@/lib/motion'
import { useUi, toast } from '@/stores/ui'
import { useCreateTask, useMoveTask } from './api'
import { Flight, type FlightFx } from './flight'
import { slotOf, toLanes } from './order'
import { TaskCard } from './TaskCard'

const DRAG_START_PX = 5
const LONG_PRESS_MS = 320
const MAX_TILT_DEG = 5
const LIFT_SCALE = 1.03
const JUST_DONE_MS = 600
const NEW_CARD_MS = 600
const AMBIENT_DELAY_MS = 25_000
const AMBIENT_RETRY_MS = 8_000
const PICKUP_MS = 1200

interface Drag {
  code: string
  card: HTMLElement
  x: number
  y: number
  px: number
  x0: number
  y0: number
  ox: number
  oy: number
  tilt: number
  scale: number
  ghost: HTMLElement | null
  pointerId: number
}

export interface BoardApi {
  move: (code: string, status: StatusId) => void
}

interface Props {
  ws: Workspace
  listId: string
  tasks: Task[]
  lens: string | null
  selected: string | null
  onOpen: (code: string) => void
  boardRef: React.RefObject<HTMLDivElement | null>
  apiRef: React.RefObject<BoardApi | null>
}

// shortcut: the ambient teammate move runs once per page load, on the demo's sample task only
let ambientDone = false

export function Board({ ws, listId, tasks, lens, selected, onOpen, boardRef, apiRef }: Props) {
  const lanes = useMemo(() => toLanes(tasks), [tasks])
  const people = useMemo(() => new Map(ws.members.map((m) => [m.id, m])), [ws.members])
  const move = useMoveTask(listId)
  const create = useCreateTask(listId)
  const composer = useUi((s) => s.composer)
  const setComposer = useUi((s) => s.setComposer)
  const tourDone = useUi((s) => s.tourDone)
  const setLastUndo = useUi((s) => s.setLastUndo)
  const flight = useRef(new Flight())
  const drag = useRef<Drag | null>(null)
  const justDragged = useRef(false)
  const [dragCode, setDragCode] = useState<string | null>(null)
  const [marker, setMarker] = useState<{ status: StatusId; before: string | null } | null>(null)
  const [justDone, setJustDone] = useState<string | null>(null)
  const [fresh, setFresh] = useState<string | null>(null)
  const [remote, setRemote] = useState<{ code: string; who: Member } | null>(null)
  const counts = useRef<Record<string, number>>({})
  const [bumped, setBumped] = useState<Record<string, number>>({})

  // a move is async (optimistic update after a microtask); a second key press before it renders reads this
  const intent = useRef(new Map<string, StatusId>())
  useLayoutEffect(() => {
    intent.current.clear()
    flight.current.play(boardRef.current)
  }, [tasks, boardRef])

  // the count beside a lane bumps when it changes
  useEffect(() => {
    const next: Record<string, number> = {}
    STATUSES.forEach((s) => {
      const n = lanes[s.id].length
      if (counts.current[s.id] !== undefined && counts.current[s.id] !== n) next[s.id] = (bumped[s.id] ?? 0) + 1
      counts.current[s.id] = n
    })
    if (Object.keys(next).length) setBumped((b) => ({ ...b, ...next }))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only lane sizes matter
  }, [lanes])

  function doMove(code: string, status: StatusId, before: string | null, fx: Omit<FlightFx, 'moved'> = {}, actor?: Member) {
    const t = tasks.find((x) => x.code === code)
    if (!t) return
    const back = slotOf(tasks, code)
    const from = intent.current.get(code) ?? t.status
    const changed = from !== status
    intent.current.set(code, status)
    flight.current.prepare(boardRef.current, {
      ...fx,
      moved: code,
      remote: !!actor,
      onLand: () => {
        if (changed && status === 'done') {
          setJustDone(code)
          window.setTimeout(() => setJustDone((c) => (c === code ? null : c)), JUST_DONE_MS)
        }
      },
    })
    move.mutate({ code, status, beforeCode: before, actor: actor?.id })
    if (!changed) return
    if (actor) {
      toast(`${actor.name} moved ${code} to ${statusName(status)}`)
      return
    }
    const undo = () => {
      useUi.getState().setLastUndo(null)
      if (back) doMoveRef.current(code, back.status, back.beforeCode)
      window.setTimeout(() => focusCard(code), FLIGHT_MS)
    }
    setLastUndo(undo)
    toast(`Moved ${code} to ${statusName(status)}`, undo)
    if (status === 'done') tourDone('move')
  }
  const doMoveRef = useRef(doMove)

  const focusCard = (code: string) =>
    boardRef.current?.querySelector<HTMLElement>(`.card[data-code="${code}"]`)?.focus({ preventScroll: true })
  const firstIn = (status: StatusId, except?: string) => lanes[status].find((t) => t.code !== except)?.code ?? null
  const tasksRef = useRef(tasks)
  const firstInRef = useRef(firstIn)
  // timers and window listeners read the latest render through these
  useLayoutEffect(() => {
    doMoveRef.current = doMove
    tasksRef.current = tasks
    firstInRef.current = firstIn
    apiRef.current = { move: (code, status) => doMoveRef.current(code, status, firstInRef.current(status, code)) }
  })

  /* ---------- drag and drop: the card lifts under the pointer, leans with its speed and settles where it lands ---------- */
  useEffect(() => {
    let raf = 0
    let press: number | undefined
    const follow = () => {
      const d = drag.current
      if (!d?.ghost) return
      const calm = reduceMotion()
      const v = d.x - d.px
      d.px = d.x
      d.tilt += ((calm ? 0 : Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, v * 0.35))) - d.tilt) * 0.18 // leans toward its horizontal speed
      d.scale += ((calm ? 1 : LIFT_SCALE) - d.scale) * 0.25
      d.ghost.style.transform = `translate(${d.x - d.ox}px, ${d.y - d.oy}px) rotate(${d.tilt}deg) scale(${d.scale})`
      raf = requestAnimationFrame(follow)
    }
    const lift = (d: Drag) => {
      const r = d.card.getBoundingClientRect()
      d.ox = d.x0 - r.left
      d.oy = d.y0 - r.top
      const g = d.card.cloneNode(true) as HTMLElement
      g.classList.add('fly', 'held')
      g.classList.remove('sel', 'lit', 'new')
      g.removeAttribute('tabindex')
      g.removeAttribute('aria-label')
      g.setAttribute('aria-hidden', 'true')
      Object.assign(g.style, { position: 'fixed', left: '0', top: '0', width: `${r.width}px`, margin: '0' })
      document.body.appendChild(g)
      d.ghost = g
      document.documentElement.classList.add('grabbing')
      setDragCode(d.code)
      follow()
    }
    const target = (x: number, y: number) => {
      const body = document.elementFromPoint(x, y)?.closest<HTMLElement>('.lane-body')
      if (!body || !boardRef.current?.contains(body)) return null
      const after = [...body.querySelectorAll<HTMLElement>('.card:not(.dragging)')].find((c) => {
        const r = c.getBoundingClientRect()
        return y < r.top + r.height / 2
      })
      return { status: body.dataset.status as StatusId, before: after?.dataset.code ?? null }
    }
    const end = (drop: boolean) => {
      window.clearTimeout(press)
      const d = drag.current
      drag.current = null
      if (!d?.ghost) return
      cancelAnimationFrame(raf)
      justDragged.current = true
      window.setTimeout(() => {
        justDragged.current = false // the click that ends a drag must not open a task
      }, 0)
      const spot = drop ? target(d.x, d.y) : null
      const fx = { from: { left: d.x - d.ox, top: d.y - d.oy }, tilt: d.tilt, scale: d.scale }
      d.ghost.remove()
      document.documentElement.classList.remove('grabbing')
      setMarker(null)
      setDragCode(null)
      if (spot) doMoveRef.current(d.code, spot.status, spot.before === d.code ? null : spot.before, fx)
      else {
        // dropped outside a lane, or Escape: the card flies home
        flight.current.prepare(null, { moved: d.code, ...fx })
        requestAnimationFrame(() => flight.current.play(boardRef.current))
      }
    }
    const down = (e: PointerEvent) => {
      const c = (e.target as HTMLElement).closest<HTMLElement>('.card[data-code]')
      if (!c || e.button !== 0 || (e.target as HTMLElement).closest('button, a, input')) return
      drag.current = {
        code: c.dataset.code!,
        card: c,
        x: e.clientX,
        y: e.clientY,
        px: e.clientX,
        x0: e.clientX,
        y0: e.clientY,
        ox: 0,
        oy: 0,
        tilt: 0,
        scale: 1,
        ghost: null,
        pointerId: e.pointerId,
      }
      // touch lifts on a long press, so a swipe still scrolls the lane
      if (e.pointerType === 'touch') press = window.setTimeout(() => drag.current && lift(drag.current), LONG_PRESS_MS)
    }
    const moveP = (e: PointerEvent) => {
      const d = drag.current
      if (!d || e.pointerId !== d.pointerId) return
      d.x = e.clientX
      d.y = e.clientY
      if (!d.ghost) {
        if (Math.hypot(d.x - d.x0, d.y - d.y0) < DRAG_START_PX) return
        if (e.pointerType === 'touch') {
          window.clearTimeout(press) // moved before the long press: it's a scroll
          drag.current = null
          return
        }
        lift(d)
      }
      if (e.pointerType === 'touch') e.preventDefault()
      setMarker((m) => {
        const n = target(d.x, d.y)
        return m?.status === n?.status && m?.before === n?.before ? m : n
      })
    }
    const up = () => end(true)
    const cancel = () => end(false)
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drag.current?.ghost) {
        e.stopImmediatePropagation()
        end(false)
      }
    }
    const board = boardRef.current
    board?.addEventListener('pointerdown', down)
    addEventListener('pointermove', moveP, { passive: false })
    addEventListener('pointerup', up)
    addEventListener('pointercancel', cancel)
    addEventListener('keydown', key, true)
    const stopTouchMenu = (e: Event) => drag.current && e.preventDefault()
    board?.addEventListener('contextmenu', stopTouchMenu)
    return () => {
      board?.removeEventListener('pointerdown', down)
      removeEventListener('pointermove', moveP)
      removeEventListener('pointerup', up)
      removeEventListener('pointercancel', cancel)
      removeEventListener('keydown', key, true)
      board?.removeEventListener('contextmenu', stopTouchMenu)
      cancelAnimationFrame(raf)
    }
  }, [boardRef])

  /* ---------- one quiet live moment: a teammate moves a card on their own (demo only) ---------- */
  useEffect(() => {
    if (!ws.demo || listId !== 'sprint-14' || ambientDone) return
    const jonas = people.get('jw')
    let t = 0
    const tick = () => {
      const x = tasksRef.current.find((k) => k.code === 'WEB-138')
      if (!jonas || ambientDone || !x || x.status !== 'doing') return
      const st = useUi.getState()
      if (drag.current || st.composer || st.paletteOpen) {
        t = window.setTimeout(tick, AMBIENT_RETRY_MS)
        return
      }
      ambientDone = true
      setRemote({ code: 'WEB-138', who: jonas }) // Jonas picks it up before it moves
      t = window.setTimeout(
        () => {
          doMoveRef.current('WEB-138', 'review', firstInRef.current('review', 'WEB-138'), {}, jonas)
          t = window.setTimeout(() => setRemote(null), GLIDE_MS + REMOTE_HOLD_MS)
        },
        reduceMotion() ? 0 : PICKUP_MS,
      )
    }
    t = window.setTimeout(tick, AMBIENT_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [ws.demo, listId, people])

  /* ---------- keyboard on cards ---------- */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const c = e.target as HTMLElement
    if (!c.classList.contains('card')) return
    const code = c.dataset.code!
    const t = tasks.find((x) => x.code === code)
    if (!t) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(code)
    } else if (e.shiftKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault()
      const now = intent.current.get(code) ?? t.status
      const i = STATUSES.findIndex((s) => s.id === now) + (e.key === 'ArrowRight' ? 1 : -1)
      const next = STATUSES[i]
      if (!next) return
      doMove(code, next.id, firstIn(next.id, code))
      requestAnimationFrame(() => focusCard(code))
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const sib = (e.key === 'ArrowDown' ? c.nextElementSibling : c.previousElementSibling) as HTMLElement | null
      if (sib?.classList.contains('card')) sib.focus()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const bodies = [...(boardRef.current?.querySelectorAll<HTMLElement>('.lane-body') ?? [])]
      bodies[bodies.indexOf(c.parentElement!) + (e.key === 'ArrowRight' ? 1 : -1)]?.querySelector<HTMLElement>('.card')?.focus()
    }
  }

  const addTask = (status: StatusId, title: string) => {
    create.mutate(
      { title, status },
      {
        onSuccess: (t) => {
          setFresh(t.code)
          window.setTimeout(() => setFresh((c) => (c === t.code ? null : c)), NEW_CARD_MS)
          toast(`Created ${t.code}. Keep typing to add another.`)
        },
      },
    )
  }

  return (
    <div
      className={`board${lens ? ' lensing' : ''}`}
      ref={boardRef}
      aria-label={`${ws.lists.find((l) => l.id === listId)?.name ?? 'List'} board`}
      onClick={(e) => {
        if (justDragged.current) return
        const c = (e.target as HTMLElement).closest<HTMLElement>('.card[data-code]')
        if (c) onOpen(c.dataset.code!)
      }}
      onKeyDown={onKeyDown}
    >
      {STATUSES.map((s) => (
        <section className="lane" key={s.id} aria-labelledby={`h-${s.id}`}>
          <header className="lane-head">
            <span className="sg">
              <StatusGlyph s={s.id} />
            </span>
            <h2 id={`h-${s.id}`}>{s.name}</h2>
            <span key={bumped[s.id] ?? 0} className={`count${bumped[s.id] ? ' bump' : ''}`}>
              {lanes[s.id].length}
            </span>
            <button className="icon-btn add" type="button" aria-label={`Add a task to ${s.name}`} onClick={() => setComposer(s.id)}>
              <I icon={Plus} />
            </button>
          </header>
          <div className={`lane-body${marker?.status === s.id ? ' over' : ''}`} data-status={s.id}>
            {composer === s.id && (
              <Composer meName="You" onAdd={(title) => addTask(s.id, title)} onDone={() => setComposer(null)} busy={create.isPending} />
            )}
            {lanes[s.id].map((t) => (
              <LaneSlot key={t.code} showMarker={marker?.status === s.id && marker.before === t.code}>
                <TaskCard
                  t={t}
                  owner={people.get(t.ownerId)}
                  today={ws.today}
                  flags={{
                    selected: selected === t.code,
                    lit: !!lens && t.ownerId === lens,
                    dragging: dragCode === t.code,
                    isNew: fresh === t.code,
                    justDone: justDone === t.code,
                    remoteBy: remote?.code === t.code ? remote.who : null,
                  }}
                />
              </LaneSlot>
            ))}
            {marker?.status === s.id && marker.before === null && <DropMarker />}
            {lanes[s.id].length === 0 && composer !== s.id && !marker && <p className="lane-empty">No tasks</p>}
          </div>
        </section>
      ))}
    </div>
  )
}

function LaneSlot({ showMarker, children }: { showMarker: boolean; children: React.ReactNode }) {
  return (
    <>
      {showMarker && <DropMarker />}
      {children}
    </>
  )
}

function DropMarker() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!reduceMotion())
      ref.current?.animate(
        [
          { transform: 'scaleX(.6)', opacity: 0.4 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 160, easing: EASE_OUT },
      )
  }, [])
  return <div className="drop-marker" ref={ref} aria-hidden="true" />
}

const CLOSE_DELAY_MS = 120

/** the composer stays open so several tasks can be added in a row */
function Composer({ meName, onAdd, onDone, busy }: { meName: string; onAdd: (title: string) => void; onDone: () => void; busy: boolean }) {
  const [v, setV] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => input.current?.focus(), [])
  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault()
        const title = v.trim()
        if (!title || busy) return input.current?.focus()
        onAdd(title)
        setV('')
      }}
    >
      <label className="sr" htmlFor="new-title">
        New task title
      </label>
      <input
        ref={input}
        id="new-title"
        placeholder="What needs doing?"
        autoComplete="off"
        maxLength={140}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            onDone()
          }
        }}
        onBlur={() => {
          if (!v.trim()) window.setTimeout(() => document.activeElement?.id !== 'new-title' && onDone(), CLOSE_DELAY_MS)
        }}
      />
      <div className="composer-foot">
        <span>{meName} · due in 5 days</span>
        <span>
          <kbd>↵</kbd> add <kbd>esc</kbd> done
        </span>
      </div>
    </form>
  )
}
