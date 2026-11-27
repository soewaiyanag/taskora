import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { api, ApiError } from '@/api/client'
import type { Session, Task, Workspace } from '@/api/types'
import { resetDb } from './db'
import { handlers } from './handlers'
import { DEMO_EMAIL, DEMO_PASSWORD } from './seed'

const server = setupServer(...handlers)
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterAll(() => server.close())
beforeEach(() => {
  localStorage.clear()
  resetDb()
})

const lane = (tasks: Task[], status: Task['status']) =>
  tasks
    .filter((t) => t.status === status)
    .sort((a, b) => a.position - b.position)
    .map((t) => t.code)

describe('mock API', () => {
  it('answers a wrong password with a problem+json 401', async () => {
    const err = await api('/auth/login', { method: 'POST', json: { email: DEMO_EMAIL, password: 'not-the-password' } }).catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(401)
    expect((err as ApiError).detail).toMatch(/don’t match/)
  })

  it('logs in and moves a task, logging who moved it', async () => {
    const s = await api<Session>('/auth/login', { method: 'POST', json: { email: DEMO_EMAIL, password: DEMO_PASSWORD } })
    expect(s.user.initials).toBe('MT')
    const tasks = await api<Task[]>('/tasks/WEB-142/move', { method: 'POST', json: { status: 'done', beforeCode: 'WEB-131' } })
    expect(lane(tasks, 'done')[0]).toBe('WEB-142')
    const t = await api<Task>('/tasks/WEB-142')
    expect(t.activity.at(-1)?.text).toBe('moved this to Done')
  })

  it('numbers new tasks from the space prefix', async () => {
    await api('/auth/demo', { method: 'POST' })
    const t = await api<Task>('/lists/sprint-14/tasks', { method: 'POST', json: { title: 'Ship it', status: 'todo' } })
    expect(t.code).toBe('WEB-162')
    expect(t.due).toBe('2026-11-20')
  })

  it('keeps a new account out of the demo workspace (tenancy)', async () => {
    const s = await api<Session>('/auth/signup', {
      method: 'POST',
      json: { name: 'Ada Lovelace', email: 'ada@example.com', password: 'a-long-enough-password' },
    })
    expect(s.workspaces).toHaveLength(1)
    const own = await api<Workspace>(`/workspaces/${s.workspaces[0]!.slug}`)
    expect(own.members.map((m) => m.name)).toEqual(['Ada Lovelace'])
    const err = await api('/workspaces/northwind').catch((e) => e)
    expect((err as ApiError).status).toBe(404)
    const taskErr = await api('/tasks/WEB-142').catch((e) => e)
    expect((taskErr as ApiError).status).toBe(404)
  })

  it('refuses to delete the demo workspace', async () => {
    await api('/auth/demo', { method: 'POST' })
    const err = await api('/workspaces/northwind', { method: 'DELETE' }).catch((e) => e)
    expect((err as ApiError).status).toBe(403)
  })
})
