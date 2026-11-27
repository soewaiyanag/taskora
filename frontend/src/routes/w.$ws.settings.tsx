import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/w/$ws/settings')({
  beforeLoad: ({ location, params }) => {
    if (location.pathname.replace(/\/$/, '').endsWith('/settings')) throw redirect({ to: '/w/$ws/settings/profile', params })
  },
  component: Outlet,
})
