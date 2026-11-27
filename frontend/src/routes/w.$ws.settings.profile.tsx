import { createFileRoute } from '@tanstack/react-router'
import { SettingsShell } from '@/features/settings/SettingsShell'
import { ProfilePage } from '@/features/settings/pages'

export const Route = createFileRoute('/w/$ws/settings/profile')({
  component: function Page() {
    const { ws } = Route.useParams()
    return (
      <SettingsShell slug={ws} page="profile">
        <ProfilePage slug={ws} />
      </SettingsShell>
    )
  },
})
