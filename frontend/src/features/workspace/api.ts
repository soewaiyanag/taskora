import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { InviteState, Member, Role, Workspace } from '@/api/types'
import { keys } from '@/lib/query'

export const workspaceQuery = (slug: string) =>
  queryOptions({ queryKey: keys.workspace(slug), queryFn: () => api<Workspace>(`/workspaces/${slug}`) })

export const useWorkspace = (slug: string) => useSuspenseQuery(workspaceQuery(slug)).data

export const invitesQuery = (slug: string) =>
  queryOptions({ queryKey: keys.invites(slug), queryFn: () => api<InviteState>(`/workspaces/${slug}/invites`) })

/** members by id, with the lens shortcut order (1–5) */
export function peopleOf(ws: Workspace) {
  const byId = new Map<string, Member>(ws.members.map((m) => [m.id, m]))
  return { byId, order: ws.members }
}

function useWorkspaceMutation<V>(slug: string, fn: (v: V) => Promise<Workspace>) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: (ws) => qc.setQueryData(keys.workspace(slug), ws) })
}

export const useRenameWorkspace = (slug: string) =>
  useWorkspaceMutation(slug, (name: string) => api<Workspace>(`/workspaces/${slug}`, { method: 'PATCH', json: { name } }))

export const useSetPrefix = (slug: string) =>
  useWorkspaceMutation(slug, (v: { spaceId: string; prefix: string }) =>
    api<Workspace>(`/workspaces/${slug}/spaces/${v.spaceId}`, { method: 'PATCH', json: { prefix: v.prefix } }),
  )

export const useSetRole = (slug: string) =>
  useWorkspaceMutation(slug, (v: { userId: string; role: Exclude<Role, 'Owner'> }) =>
    api<Workspace>(`/workspaces/${slug}/members/${v.userId}`, { method: 'PATCH', json: { role: v.role } }),
  )

function useInviteMutation<V>(slug: string, fn: (v: V) => Promise<InviteState>) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: (s) => qc.setQueryData(keys.invites(slug), s) })
}
export const useInvite = (slug: string) =>
  useInviteMutation(slug, (v: { email: string; role: 'Member' | 'Admin' }) =>
    api<InviteState>(`/workspaces/${slug}/invites`, { method: 'POST', json: v }),
  )
export const useRevokeInvite = (slug: string) =>
  useInviteMutation(slug, (id: string) => api<InviteState>(`/workspaces/${slug}/invites/${id}`, { method: 'DELETE' }))
export const useResetLink = (slug: string) =>
  useInviteMutation(slug, () => api<InviteState>(`/workspaces/${slug}/invite-link`, { method: 'POST' }))

export function useDeleteWorkspace(slug: string) {
  return useMutation({ mutationFn: () => api<void>(`/workspaces/${slug}`, { method: 'DELETE' }) })
}
