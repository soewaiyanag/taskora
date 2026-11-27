import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { queryClient } from '@/lib/query'
import { NotFound } from '@/routes/__root'
import { routeTree } from './routeTree.gen'
import './index.css'

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  // route loaders read through TanStack Query, so the router never caches on its own
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: NotFound,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

async function start() {
  // No Go API is deployed yet, so the mock API (MSW) answers /api/v1 in every build for now.
  // shortcut: set VITE_API_MOCK=off once the real API is reachable at the same origin.
  if (import.meta.env.VITE_API_MOCK !== 'off') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
void start()
