import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { Toast } from '@/components/Toast'
import { Mark } from '@/components/ui/glyphs'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <>
      <Outlet />
      <Toast />
    </>
  ),
  notFoundComponent: NotFound,
  errorComponent: ({ error, reset }) => (
    <main className="lost">
      <div>
        <Mark className="mark lost-mark" />
        <h1>Something went wrong</h1>
        <p>{error instanceof Error ? error.message : 'An unexpected error.'} Your changes up to now are saved.</p>
        <button className="btn btn-primary" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  ),
})

export function NotFound() {
  return (
    <main className="lost">
      <div>
        <Mark className="mark lost-mark" />
        <h1>This page isn’t on the wall</h1>
        <p>The link may be old, or the list was moved. Your boards are a click away.</p>
        <Link className="btn btn-primary" to="/">
          Go to my boards
        </Link>
      </div>
    </main>
  )
}
