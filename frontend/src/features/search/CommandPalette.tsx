import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import type { Ink } from '@/api/types'
import { I, inkStyle } from '@/components/ui/glyphs'
import { useUi } from '@/stores/ui'

export interface PaletteItem {
  label: string
  /** text the query matches against, beyond the label */
  keywords?: string
  code?: string
  kbd?: string
  ink?: Ink
  run: () => void
}
export interface PaletteGroup {
  name: string
  items: PaletteItem[]
  /** cap per group while showing results */
  limit?: number
}

/** ⌘K: one combobox over tasks, people, places and actions. Arrow keys choose, Enter runs, Escape closes. */
export function CommandPalette({ groups }: { groups: PaletteGroup[] }) {
  const open = useUi((s) => s.paletteOpen)
  // mounted only while open, so every opening starts with an empty query
  return open ? <Palette groups={groups} /> : null
}

function Palette({ groups }: { groups: PaletteGroup[] }) {
  const setOpen = useUi((s) => s.setPalette)
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const [returnTo] = useState(() => document.activeElement as HTMLElement | null)

  useEffect(() => input.current?.focus(), [])

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const hit = (it: PaletteItem) => !needle || `${it.code ?? ''} ${it.label} ${it.keywords ?? ''}`.toLowerCase().includes(needle)
    return groups.map((g) => ({ ...g, items: g.items.filter(hit).slice(0, g.limit) })).filter((g) => g.items.length)
  }, [groups, q])
  const flat = shown.flatMap((g) => g.items)

  const close = (restore = true) => {
    setOpen(false)
    if (restore) returnTo?.focus?.()
  }
  const run = (i: number) => {
    const it = flat[i]
    if (!it) return
    close(false)
    it.run()
  }
  const select = (i: number) => {
    const n = (i + flat.length) % flat.length
    setIdx(n)
    list.current?.querySelector(`#po-${n}`)?.scrollIntoView({ block: 'nearest' })
  }

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        className="pal"
        role="dialog"
        aria-modal="true"
        aria-label="Search and commands"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            e.stopPropagation()
            close()
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            if (flat.length) select(idx + (e.key === 'ArrowDown' ? 1 : -1))
          } else if (e.key === 'Enter') {
            e.preventDefault()
            run(idx)
          } else if (e.key === 'Tab') e.preventDefault() // focus stays in the input
        }}
      >
        <div className="pal-in">
          <I icon={Search} />
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls="pal-list"
            aria-autocomplete="list"
            aria-activedescendant={flat.length ? `po-${idx}` : undefined}
            aria-label="Search tasks, people and actions"
            placeholder="Search tasks, people and actions"
            autoComplete="off"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setIdx(0)
            }}
          />
        </div>
        <ul className="pal-list" id="pal-list" role="listbox" aria-label="Results" ref={list}>
          {shown.length === 0 ? (
            <li className="pal-empty" role="presentation">
              Nothing matches “{q}”. Try a task code like WEB-142.
            </li>
          ) : (
            shown.map((g) => <PaletteSection key={g.name} group={g} flat={flat} idx={idx} onHover={setIdx} onRun={run} />)
          )}
        </ul>
        <div className="pal-foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> choose
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}

function PaletteSection({
  group,
  flat,
  idx,
  onHover,
  onRun,
}: {
  group: PaletteGroup
  flat: PaletteItem[]
  idx: number
  onHover: (i: number) => void
  onRun: (i: number) => void
}) {
  return (
    <>
      <li className="pal-group" role="presentation">
        {group.name}
      </li>
      {group.items.map((it) => {
        const i = flat.indexOf(it)
        return (
          <li
            key={`${group.name}-${it.code ?? it.label}`}
            className="pal-opt"
            role="option"
            id={`po-${i}`}
            aria-selected={i === idx}
            onMouseMove={() => i !== idx && onHover(i)}
            onClick={() => onRun(i)}
          >
            {it.ink ? <span className="pdot" style={inkStyle(it.ink)} /> : <span className="pdot plain" />}
            <span className="pl">{it.label}</span>
            {it.code && <span className="pc">{it.code}</span>}
            {it.kbd && <kbd>{it.kbd}</kbd>}
          </li>
        )
      })}
    </>
  )
}
