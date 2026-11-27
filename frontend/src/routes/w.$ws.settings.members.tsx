import { createFileRoute } from '@tanstack/react-router'
import { SettingsShell } from '@/features/settings/SettingsShell'
import { MembersPage } from '@/features/settings/pages'

export const Route = createFileRoute('/w/$ws/settings/members')({
  component: function Page() {
    const { ws } = Route.useParams()
    return (
      <SettingsShell slug={ws} page="members">
        <MembersPage slug={ws} />
      </SettingsShell>
    )
  },
})
