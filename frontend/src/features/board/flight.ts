import { CARRY, EASE_OUT, FLIGHT_MS, GLIDE_MS, NUDGE_MS, SETTLE, reduceMotion } from '@/lib/motion'

/** What the next render should animate. */
export interface FlightFx {
  moved?: string
  /** a teammate's move glides instead of flying */
  remote?: boolean
  /** where a dropped card was released, so it flies from the pointer rather than its old slot */
  from?: { left: number; top: number }
  tilt?: number
  scale?: number
  onLand?: () => void
}

const NUDGE_PX = 4

/**
 * Cards animate from where they were (FLIP), so a move reads as paper travelling across the wall.
 * A moving card can't travel inside its own scrolling lane (it would be clipped), so a fixed-position
 * copy flies over the wall and hands off to the real card on landing.
 */
export class Flight {
  private rects = new Map<string, DOMRect>()
  private fx: FlightFx | null = null

  prepare(board: HTMLElement | null, fx: FlightFx) {
    this.rects.clear()
    this.fx = fx
    if (!board || reduceMotion()) return
    board.querySelectorAll<HTMLElement>('.card[data-code]').forEach((c) => this.rects.set(c.dataset.code!, c.getBoundingClientRect()))
  }

  /** call after the DOM reflects the new order */
  play(board: HTMLElement | null) {
    const fx = this.fx
    this.fx = null
    if (!fx || !board) return
    if (reduceMotion()) {
      fx.onLand?.()
      return
    }
    let landed = false
    board.querySelectorAll<HTMLElement>('.card[data-code]').forEach((c) => {
      const code = c.dataset.code!
      const r0 = fx.from && code === fx.moved ? fx.from : this.rects.get(code)
      if (!r0) return
      const r1 = c.getBoundingClientRect()
      const dx = r0.left - r1.left
      const dy = r0.top - r1.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
      if (code === fx.moved || Math.abs(dx) > NUDGE_PX) {
        const mine = code === fx.moved
        if (mine) landed = true
        fly(c, dx, dy, mine ? fx : {}, mine ? fx.onLand : undefined)
      } else c.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: NUDGE_MS, easing: EASE_OUT })
    })
    if (!landed) fx.onLand?.()
  }
}

function fly(card: HTMLElement, dx: number, dy: number, o: FlightFx, onLand?: () => void) {
  const r1 = card.getBoundingClientRect()
  const ghost = card.cloneNode(true) as HTMLElement
  ghost.classList.add('fly')
  ghost.classList.remove('sel', 'lit', 'new')
  ghost.removeAttribute('tabindex')
  ghost.removeAttribute('aria-label')
  ghost.setAttribute('aria-hidden', 'true')
  Object.assign(ghost.style, { position: 'fixed', left: `${r1.left}px`, top: `${r1.top}px`, width: `${r1.width}px`, margin: '0' })
  document.body.appendChild(ghost)
  card.style.transition = 'none'
  card.style.opacity = '0'
  const anim = ghost.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) rotate(${o.remote ? 0 : (o.tilt ?? 1.2)}deg) scale(${o.scale ?? 1})` },
      { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
    ],
    o.remote ? { duration: GLIDE_MS, easing: CARRY } : { duration: FLIGHT_MS, easing: SETTLE },
  )
  const land = () => {
    ghost.remove()
    card.style.opacity = ''
    void card.offsetWidth
    card.style.transition = ''
    onLand?.()
  }
  anim.onfinish = land
  anim.oncancel = land
}
