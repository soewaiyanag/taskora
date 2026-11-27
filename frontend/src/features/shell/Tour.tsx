import { useEffect, useRef, useState } from 'react'
import { TOUR_STEPS, useUi, type TourStep } from '@/stores/ui'

const STEPS: Record<TourStep, { title: string; hint: string }> = {
  lens: { title: 'See a teammate’s work', hint: 'Hover an avatar, or press 1' },
  open: { title: 'Open a task', hint: 'Click any card' },
  move: { title: 'Move a task to Done', hint: 'Drag it there, or press ⇧→' },
  palette: { title: 'Jump anywhere', hint: 'Press ⌘K' },
}
const WRAP_MS = 900

function Tick() {
  return (
    <span className="tick" aria-hidden="true">
      <svg viewBox="0 0 16 16">
        <path d="m3.5 8.5 3 3 6-7" />
      </svg>
    </span>
  )
}

/** Guest tour: the demo explains itself in a minute. Steps tick themselves off as the visitor does them. */
export function Tour() {
  const done = useUi((s) => s.tour)
  const [just, setJust] = useState<TourStep | null>(null)
  const [wrapped, setWrapped] = useState(done.length === TOUR_STEPS.length)
  const [live, setLive] = useState('')
  const seen = useRef(done.length)

  useEffect(() => {
    if (done.length <= seen.current) return
    seen.current = done.length
    const last = done[done.length - 1]!
    setJust(last)
    setLive(`Done: ${STEPS[last].title}. ${done.length} of ${TOUR_STEPS.length}.`)
    if (done.length === TOUR_STEPS.length) {
      const t = window.setTimeout(() => {
        setWrapped(true)
        setLive('That’s the core loop.')
      }, WRAP_MS)
      return () => window.clearTimeout(t)
    }
  }, [done])

  const n = done.length
  return (
    <>
      <section className="tour" aria-label="Try Taskora">
        {wrapped ? (
          <>
            <h2>
              That’s the core loop{' '}
              <span>
                {n} of {TOUR_STEPS.length}
              </span>
            </h2>
            <div className="tour-segs" aria-hidden="true">
              {TOUR_STEPS.map((s, i) => (
                <i key={s} className="on all" style={{ '--i': i } as React.CSSProperties} />
              ))}
            </div>
            <p className="tour-end">Lens, task, move, search: the whole app in four moves. Shortcuts for next time:</p>
            <div className="keys">
              <kbd>C</kbd>
              <span>New task</span>
              <kbd>1–5 · 0</kbd>
              <span>Lens on · off</span>
              <kbd>⇧ ←/→</kbd>
              <span>Move a task</span>
              <kbd>⌘Z</kbd>
              <span>Undo a move</span>
            </div>
          </>
        ) : (
          <>
            <h2>
              Try Taskora in a minute{' '}
              <span>
                {n} of {TOUR_STEPS.length}
              </span>
            </h2>
            <div className="tour-segs" aria-hidden="true">
              {TOUR_STEPS.map((s, i) => (
                <i key={s} className={`${i < n ? 'on' : ''}${i === n - 1 && just ? ' just' : ''}`} />
              ))}
            </div>
            <ol>
              {TOUR_STEPS.map((s) => (
                <li key={s} className={`${done.includes(s) ? 'done' : ''}${just === s ? ' just' : ''}`}>
                  <Tick />
                  <span>
                    {STEPS[s].title}
                    <small>{STEPS[s].hint}</small>
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
      <p className="sr" aria-live="polite">
        {live}
      </p>
    </>
  )
}
