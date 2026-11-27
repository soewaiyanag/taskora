import { createFileRoute, redirect } from '@tanstack/react-router'
import { meQuery } from '@/features/auth/api'
import { LoginPage } from '@/features/auth/AuthPage'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    if (await context.queryClient.ensureQueryData(meQuery)) throw redirect({ to: '/' })
  },
  component: LoginPage,
})
