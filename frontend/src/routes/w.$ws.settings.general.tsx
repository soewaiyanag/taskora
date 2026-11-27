import { createFileRoute } from '@tanstack/react-router'
import { SettingsShell } from '@/features/settings/SettingsShell'
import { GeneralPage } from '@/features/settings/pages'

export const Route = createFileRoute('/w/$ws/settings/general')({
  component: function Page() {
    const { ws } = Route.useParams()
    return (
      <SettingsShell slug={ws} page="general">
        <GeneralPage slug={ws} />
      </SettingsShell>
    )
  },
})
