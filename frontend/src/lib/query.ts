import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'

const STALE_MS = 30_000
const MAX_RETRIES = 2

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_MS,
      // 4xx answers are final; only network or server errors are worth another try
      retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < MAX_RETRIES,
    },
  },
})

export const keys = {
  me: ['me'] as const,
  workspace: (slug: string) => ['workspace', slug] as const,
  tasks: (listId: string) => ['tasks', listId] as const,
  task: (code: string) => ['task', code] as const,
  myTasks: (slug: string) => ['my-tasks', slug] as const,
  notifications: ['notifications'] as const,
  prefs: ['prefs'] as const,
  invites: (slug: string) => ['invites', slug] as const,
}
