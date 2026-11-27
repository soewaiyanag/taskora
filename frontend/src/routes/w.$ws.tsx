import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { meQuery } from '@/features/auth/api'
import { workspaceQuery } from '@/features/workspace/api'

// every workspace page: signed in, and the workspace loaded before the page renders
export const Route = createFileRoute('/w/$ws')({
  beforeLoad: async ({ context }) => {
    const s = await context.queryClient.ensureQueryData(meQuery)
    if (!s) throw redirect({ to: '/login' })
  },
  loader: ({ context, params }) => context.queryClient.ensureQueryData(workspaceQuery(params.ws)),
  component: Outlet,
})
