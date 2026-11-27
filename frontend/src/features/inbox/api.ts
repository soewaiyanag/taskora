import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Notification } from '@/api/types'
import { keys } from '@/lib/query'

export const notificationsQuery = queryOptions({
  queryKey: keys.notifications,
  queryFn: () => api<Notification[]>('/notifications'),
})

/** ids omitted = mark everything read */
export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids?: string[]) => api<Notification[]>('/notifications/read', { method: 'POST', json: { ids } }),
    onMutate: (ids) => {
      qc.setQueryData<Notification[]>(keys.notifications, (old) =>
        old?.map((n) => (!ids || ids.includes(n.id) ? { ...n, unread: false } : n)),
      )
    },
    onSuccess: (list) => qc.setQueryData(keys.notifications, list),
  })
}
