import { useEffect, useRef, useState } from 'react'
import { useUi } from '@/stores/ui'

const TOAST_MS = 6000
const HIDE_MS = 300

/** One toast at a time. A new one nudges the visible toast instead of stacking. It holds while hovered or focused. */
export function Toast() {
  const msg = useUi((s) => s.toast)
  const hide = useUi((s) => s.hideToast)
  const [shown, setShown] = useState(msg)
  const [visible, setVisible] = useState(false)
  const [nudge, setNudge] = useState(0)
  const hold = useRef(false)
  const timer = useRef<number | undefined>(undefined)

  // a new message is taken in during render; the effect below only runs timers
  const [prev, setPrev] = useState(msg)
  if (msg !== prev) {
    setPrev(msg)
    if (msg) {
      if (shown && visible) setNudge((n) => n + 1)
      setShown(msg)
    }
  }

  const arm = () => {
    window.clearTimeout(timer.current)
    if (!hold.current) timer.current = window.setTimeout(hide, TOAST_MS)
  }

  useEffect(() => {
    if (msg) {
      const r = requestAnimationFrame(() => setVisible(true))
      arm()
      return () => cancelAnimationFrame(r)
    }
    const r = requestAnimationFrame(() => setVisible(false))
    const t = window.setTimeout(() => setShown(null), HIDE_MS)
    return () => {
      cancelAnimationFrame(r)
      window.clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-arm only when the message changes
  }, [msg])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div
      key={nudge}
      className={`toast${visible ? ' show' : ''}${nudge && visible ? ' nudge' : ''}`}
      role="status"
      aria-live="polite"
      hidden={!shown}
      onPointerEnter={() => {
        hold.current = true
        window.clearTimeout(timer.current)
      }}
      onPointerLeave={() => {
        hold.current = false
        arm()
      }}
      onFocus={() => {
        hold.current = true
        window.clearTimeout(timer.current)
      }}
      onBlur={() => {
        hold.current = false
        arm()
      }}
    >
      <span>{shown?.text}</span>
      {shown?.undo && (
        <button
          type="button"
          onClick={() => {
            shown.undo?.()
            hide()
          }}
        >
          Undo<kbd>⌘Z</kbd>
        </button>
      )}
    </div>
  )
}
