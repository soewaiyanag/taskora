import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '@/api/client'
import type { LoginInput, ProfileInput, SignupInput } from '@/api/schemas'
import type { Session } from '@/api/types'
import { keys } from '@/lib/query'

/** null when signed out, so route guards can branch without catching */
export const meQuery = queryOptions({
  queryKey: keys.me,
  queryFn: async () => {
    try {
      return await api<Session>('/me')
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null
      throw e
    }
  },
  staleTime: Infinity,
})

function useSessionMutation<V>(fn: (v: V) => Promise<Session>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (s) => {
      // a new person means none of the cached data is theirs
      qc.clear()
      qc.setQueryData(keys.me, s)
    },
  })
}

export const useLogin = () => useSessionMutation((v: LoginInput) => api<Session>('/auth/login', { method: 'POST', json: v }))
export const useSignup = () => useSessionMutation((v: SignupInput) => api<Session>('/auth/signup', { method: 'POST', json: v }))
export const useDemo = () => useSessionMutation(() => api<Session>('/auth/demo', { method: 'POST' }))

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      qc.clear()
      qc.setQueryData(keys.me, null)
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: ProfileInput) => api<Session>('/me', { method: 'PATCH', json: v }),
    onSuccess: (s) => {
      qc.setQueryData(keys.me, s)
      // names show on cards, members and activity
      void qc.invalidateQueries({ queryKey: ['workspace'] })
    },
  })
}
