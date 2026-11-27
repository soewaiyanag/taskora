import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { tasksQuery } from '@/features/board/api'
import { MyTasksPage, myTasksQuery } from '@/features/my-tasks/MyTasksPage'
import { workspaceQuery } from '@/features/workspace/api'

const search = z.object({
  task: z.string().optional().catch(undefined),
  show: z.enum(['done']).optional().catch(undefined),
})

export const Route = createFileRoute('/w/$ws/my-tasks')({
  validateSearch: search,
  loader: async ({ context, params }) => {
    const ws = await context.queryClient.ensureQueryData(workspaceQuery(params.ws))
    await Promise.all([
      context.queryClient.ensureQueryData(myTasksQuery(params.ws)),
      ...ws.lists.map((l) => context.queryClient.ensureQueryData(tasksQuery(l.id))),
    ])
  },
  component: function Page() {
    const { ws } = Route.useParams()
    return <MyTasksPage slug={ws} search={Route.useSearch()} />
  },
})
