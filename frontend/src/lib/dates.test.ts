import { describe, expect, it } from 'vitest'
import { addDays, dueText, longDay, railGeometry, relDue } from './dates'

const TODAY = '2026-11-15'

describe('dates', () => {
  it('names the demo day', () => expect(longDay(TODAY)).toBe('Sunday, Nov 15'))
  it('adds days across a month end', () => expect(addDays('2026-11-29', 3)).toBe('2026-12-02'))
  it('words due dates like the prototype', () => {
    expect(dueText('2026-11-14', TODAY, false)).toBe('Overdue · Nov 14')
    expect(dueText('2026-11-14', TODAY, true)).toBe('Nov 14')
    expect(dueText(TODAY, TODAY, false)).toBe('Today')
    expect(dueText('2026-11-16', TODAY, false)).toBe('Tomorrow')
    expect(relDue('2026-11-18', TODAY, false)).toBe('Due in 3 days')
    expect(relDue('2026-11-14', TODAY, false)).toBe('1 day overdue')
  })
  it('draws every rail on the same Nov 8–28 window', () => {
    const g = railGeometry('2026-11-12', '2026-11-18', TODAY)
    expect(g.left).toBeCloseTo(20)
    expect(g.width).toBeCloseTo(30)
    expect(g.today).toBeCloseTo(35)
  })
})
