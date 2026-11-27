import { createFileRoute, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { tasksQuery } from '@/features/board/api'
import { BoardPage } from '@/features/board/BoardPage'
import { workspaceQuery } from '@/features/workspace/api'

const search = z.object({
  task: z
    .string()
    .regex(/^[A-Z0-9]+-\d+$/i)
    .optional()
    .catch(undefined),
  lens: z.string().max(3).optional().catch(undefined),
})

export const Route = createFileRoute('/w/$ws/l/$listId')({
  validateSearch: search,
  loader: async ({ context, params }) => {
    const ws = await context.queryClient.ensureQueryData(workspaceQuery(params.ws))
    if (!ws.lists.some((l) => l.id === params.listId)) throw notFound()
    // every list is prefetched: the palette and Inbox search across all of them
    await Promise.all(ws.lists.map((l) => context.queryClient.ensureQueryData(tasksQuery(l.id))))
  },
  component: function Page() {
    const { ws, listId } = Route.useParams()
    return <BoardPage slug={ws} listId={listId} search={Route.useSearch()} />
  },
})
