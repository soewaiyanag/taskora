import { createFileRoute, redirect } from '@tanstack/react-router'
import { meQuery } from '@/features/auth/api'
import { SignupPage } from '@/features/auth/AuthPage'

export const Route = createFileRoute('/signup')({
  beforeLoad: async ({ context }) => {
    if (await context.queryClient.ensureQueryData(meQuery)) throw redirect({ to: '/' })
  },
  component: SignupPage,
})
