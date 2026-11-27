import { queryOptions, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Priority, StatusId, Task } from '@/api/types'
import { keys } from '@/lib/query'
import { toast } from '@/stores/ui'
import { moveTask } from './order'

export const tasksQuery = (listId: string) =>
  queryOptions({ queryKey: keys.tasks(listId), queryFn: () => api<Task[]>(`/lists/${listId}/tasks`) })

/** Optimistic edits: change the cache now, roll back and say so if the server refuses. */
function optimistic<V>(qc: QueryClient, listId: string, apply: (tasks: Task[], v: V) => Task[], failText: string) {
  return {
    onMutate: async (v: V) => {
      await qc.cancelQueries({ queryKey: keys.tasks(listId) })
      const prev = qc.getQueryData<Task[]>(keys.tasks(listId))
      if (prev) qc.setQueryData(keys.tasks(listId), apply(prev, v))
      return { prev }
    },
    onError: (_e: unknown, _v: V, ctx: { prev?: Task[] } | undefined) => {
      if (ctx?.prev) qc.setQueryData(keys.tasks(listId), ctx.prev)
      toast(failText)
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  }
}
const replace = (tasks: Task[], t: Task) => tasks.map((x) => (x.code === t.code ? t : x))

export interface MoveVars {
  code: string
  status: StatusId
  beforeCode: string | null
  /** demo only: a simulated teammate making the move */
  actor?: string
}

export function useMoveTask(listId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ code, status, beforeCode, actor }: MoveVars) =>
      api<Task[]>(`/tasks/${code}/move`, {
        method: 'POST',
        json: { status, beforeCode },
        headers: actor ? { 'X-Demo-Actor': actor } : {},
      }),
    ...optimistic<MoveVars>(
      qc,
      listId,
      (tasks, v) => moveTask(tasks, v.code, v.status, v.beforeCode),
      'Couldn’t move that task. It’s back where it was.',
    ),
    onSuccess: (tasks) => qc.setQueryData(keys.tasks(listId), tasks),
  })
}

export function useCreateTask(listId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { title: string; status: StatusId }) => api<Task>(`/lists/${listId}/tasks`, { method: 'POST', json: v }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.tasks(listId) })
      void qc.invalidateQueries({ queryKey: ['workspace'] })
    },
    onError: () => toast('Couldn’t add that task. Try again.'),
  })
}

export function useUpdateTask(listId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ code, ...patch }: { code: string; ownerId?: string; priority?: Priority }) =>
      api<Task>(`/tasks/${code}`, { method: 'PATCH', json: patch }),
    ...optimistic<{ code: string; ownerId?: string; priority?: Priority }>(
      qc,
      listId,
      (tasks, { code, ...patch }) => tasks.map((t) => (t.code === code ? { ...t, ...patch } : t)),
      'Couldn’t save that change.',
    ),
    onSuccess: (t) => qc.setQueryData<Task[]>(keys.tasks(listId), (old) => old && replace(old, t)),
  })
}

export function useToggleCheck(listId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ code, index, done }: { code: string; index: number; done: boolean }) =>
      api<Task>(`/tasks/${code}/checklist/${index}`, { method: 'POST', json: { done } }),
    ...optimistic<{ code: string; index: number; done: boolean }>(
      qc,
      listId,
      (tasks, { code, index, done }) =>
        tasks.map((t) => (t.code === code ? { ...t, checklist: t.checklist.map((c, i) => (i === index ? { ...c, done } : c)) } : t)),
      'Couldn’t update the checklist.',
    ),
    onSuccess: (t) => qc.setQueryData<Task[]>(keys.tasks(listId), (old) => old && replace(old, t)),
  })
}

export function useComment(listId: string, meId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ code, text }: { code: string; text: string }) =>
      api<Task>(`/tasks/${code}/comments`, { method: 'POST', json: { text } }),
    ...optimistic<{ code: string; text: string }>(
      qc,
      listId,
      (tasks, { code, text }) =>
        tasks.map((t) => (t.code === code ? { ...t, activity: [...t.activity, { ...pending(meId, text), comment: true }] } : t)),
      'Couldn’t post that comment. Your text is still in the box.',
    ),
    onSuccess: (t) => qc.setQueryData<Task[]>(keys.tasks(listId), (old) => old && replace(old, t)),
  })
}

const pending = (who: string, text: string) => ({ id: `pending-${Date.now()}`, who, text, comment: false, at: new Date().toISOString() })
