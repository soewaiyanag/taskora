import type { CSSProperties, ReactNode, SelectHTMLAttributes } from 'react'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { PRIORITIES, type Day, type Ink, type Priority, type StatusId } from '@/api/types'
import { railGeometry } from '@/lib/dates'

export const inkVar = (ink: Ink) => `var(--o-${ink})`
export const inkStyle = (ink: Ink | undefined, name = '--ink'): CSSProperties =>
  ({ [name]: ink ? inkVar(ink) : 'var(--fg-3)' }) as CSSProperties

/** lucide icons at the house size and stroke */
export function I({ icon: Icon, size = 16, className = 'i' }: { icon: LucideIcon; size?: number; className?: string }) {
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden="true" />
}

/** The Flagged T. The flag takes a person's ink through --flag; without it the mark is one colour. */
export function Mark({ flag, className = 'mark' }: { flag?: Ink; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" style={flag ? inkStyle(flag, '--flag') : undefined}>
      <path d="M5.5 9.5h21a2.5 2.5 0 0 1 2.5 2.5v1a2.5 2.5 0 0 1-2.5 2.5H19V27a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 13 27V15.5H5.5A2.5 2.5 0 0 1 3 13v-1a2.5 2.5 0 0 1 2.5-2.5Z" />
      <path style={{ fill: 'var(--flag, currentColor)' }} d="M20.6 3.4h5a1.9 1.9 0 0 1 1.9 1.9v3.4h-8.8V5.3a1.9 1.9 0 0 1 1.9-1.9Z" />
    </svg>
  )
}

export function Lockup({ href }: { href: string }) {
  return (
    <a className="lockup" href={href} aria-label="Taskora">
      <Mark />
      <span aria-hidden="true">taskora</span>
    </a>
  )
}

export function Avatar({
  ink,
  initials,
  size,
  title,
  online,
}: {
  ink: Ink | undefined
  initials: string
  size?: 'sm' | 'lg'
  title?: string
  online?: boolean
}) {
  return (
    <span className={`av${size ? ` ${size}` : ''}`} style={inkStyle(ink)} title={title}>
      {initials}
      {online && <span className="online" aria-hidden="true" />}
    </span>
  )
}

export function PrioGlyph({ p }: { p: Priority }) {
  const label = `${PRIORITIES[p]} priority`
  if (p === 0)
    return (
      <span className="prio urgent" title={label}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" fill="currentColor" />
          <path d="M8 4.5v4.2M8 11.2v.3" stroke="var(--paper)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    )
  return (
    <span className="prio" title={label}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={2 + i * 4.5}
            y={13 - (3 + i * 3.5)}
            width="3"
            height={3 + i * 3.5}
            rx="1"
            fill="currentColor"
            opacity={i < 4 - p ? 1 : 0.25}
          />
        ))}
      </svg>
    </span>
  )
}

export function StatusGlyph({ s, size = 16 }: { s: StatusId; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      {s === 'done' ? (
        <>
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <path d="m5 8.2 2 2 4-4.2" fill="none" stroke="var(--wall)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          {s === 'doing' && <path d="M8 4a4 4 0 0 1 0 8z" fill="currentColor" />}
          {s === 'review' && <path d="M8 4a4 4 0 1 1-4 4h4z" fill="currentColor" />}
        </>
      )}
    </svg>
  )
}

export function DoneMark({ children }: { children: ReactNode }) {
  return (
    <span className="done-mark">
      <svg className="dm" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <circle cx="8" cy="8" r="7" />
        <path d="m5 8.2 2 2 4-4.2" />
      </svg>
      {children}
    </span>
  )
}

export function Rail({ start, due, today, over }: { start: Day; due: Day; today: Day; over: boolean }) {
  const g = railGeometry(start, due, today)
  return (
    <span className="rail" aria-hidden="true">
      <span className={`bar${over ? ' over' : ''}`} style={{ left: `${g.left}%`, width: `${g.width}%` }} />
      <span className="today" style={{ left: `${g.today}%` }} />
    </span>
  )
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="sel-wrap">
      <select {...props}>{children}</select>
      <I icon={ChevronRight} />
    </span>
  )
}

export function Switch({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return <button className="switch" type="button" role="switch" aria-checked={on} aria-label={label} onClick={onToggle} />
}
