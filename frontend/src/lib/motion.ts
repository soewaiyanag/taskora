// DESIGN.md has one motion style: a 220ms settle with a slight overshoot, plus the teammate glide.
export const SETTLE = 'cubic-bezier(.34,1.32,.64,1)'
export const EASE_OUT = 'cubic-bezier(.16,1,.3,1)'
export const CARRY = 'cubic-bezier(.45,0,.2,1)'
export const FLIGHT_MS = 320
export const GLIDE_MS = 600
export const NUDGE_MS = 200
export const REMOTE_HOLD_MS = 1800

export const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
