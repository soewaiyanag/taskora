import { createFileRoute, redirect } from '@tanstack/react-router'
import { meQuery } from '@/features/auth/api'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const s = await context.queryClient.ensureQueryData(meQuery)
    const ws = s?.workspaces[0]
    if (!s) throw redirect({ to: '/login' })
    if (!ws) throw redirect({ to: '/signup' })
    throw redirect({ to: '/w/$ws', params: { ws: ws.slug } })
  },
})
