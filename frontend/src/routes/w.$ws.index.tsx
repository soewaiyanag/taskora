import { createFileRoute, redirect } from '@tanstack/react-router'
import { workspaceQuery } from '@/features/workspace/api'

export const Route = createFileRoute('/w/$ws/')({
  beforeLoad: async ({ context, params }) => {
    const ws = await context.queryClient.ensureQueryData(workspaceQuery(params.ws))
    const first = ws.lists[0]
    if (first) throw redirect({ to: '/w/$ws/l/$listId', params: { ws: params.ws, listId: first.id } })
    throw redirect({ to: '/w/$ws/my-tasks', params: { ws: params.ws } })
  },
})
