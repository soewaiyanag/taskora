import { describe, expect, it } from 'vitest'
import type { Task } from '@/api/types'
import { moveTask, slotOf, toLanes } from './order'

const t = (code: string, status: Task['status'], position: number): Task => ({
  code,
  listId: 'l',
  status,
  ownerId: 'mt',
  priority: 2,
  start: '2026-11-10',
  due: '2026-11-20',
  title: code,
  tags: [],
  description: '',
  checklist: [],
  activity: [],
  position,
})
const seed = () => [t('A', 'todo', 0), t('B', 'todo', 1), t('C', 'doing', 0), t('D', 'doing', 1)]
const codes = (tasks: Task[], s: Task['status']) => toLanes(tasks)[s].map((x) => x.code)

describe('moveTask', () => {
  it('moves into another lane before a given card and renumbers it', () => {
    const out = moveTask(seed(), 'A', 'doing', 'D')
    expect(codes(out, 'doing')).toEqual(['C', 'A', 'D'])
    expect(codes(out, 'todo')).toEqual(['B'])
  })
  it('appends when there is no card to go before', () => {
    expect(codes(moveTask(seed(), 'A', 'doing', null), 'doing')).toEqual(['C', 'D', 'A'])
  })
  it('reorders inside the same lane', () => {
    expect(codes(moveTask(seed(), 'B', 'todo', 'A'), 'todo')).toEqual(['B', 'A'])
  })
  it('does not mutate its input', () => {
    const before = seed()
    moveTask(before, 'A', 'done', null)
    expect(before[0]!.status).toBe('todo')
  })
  it('records the slot a card came from, so a move can be undone exactly', () => {
    const tasks = seed()
    const back = slotOf(tasks, 'C')!
    const moved = moveTask(tasks, 'C', 'done', null)
    expect(codes(moveTask(moved, 'C', back.status, back.beforeCode), 'doing')).toEqual(['C', 'D'])
  })
})
