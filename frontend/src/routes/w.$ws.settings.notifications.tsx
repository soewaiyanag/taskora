import { createFileRoute } from '@tanstack/react-router'
import { SettingsShell } from '@/features/settings/SettingsShell'
import { NotificationsPage } from '@/features/settings/pages'

export const Route = createFileRoute('/w/$ws/settings/notifications')({
  component: function Page() {
    const { ws } = Route.useParams()
    return (
      <SettingsShell slug={ws} page="notifications">
        <NotificationsPage />
      </SettingsShell>
    )
  },
})
