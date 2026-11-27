import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Bell, ChevronLeft, LayoutGrid, Moon, Sun, User, Users } from 'lucide-react'
import { Avatar, I, Mark } from '@/components/ui/glyphs'
import { useSession } from '@/features/shell/AppShell'
import { useWorkspace } from '@/features/workspace/api'
import { isDark, useUi } from '@/stores/ui'

export type SettingsPage = 'profile' | 'notifications' | 'general' | 'members'

const PAGES: { id: SettingsPage; label: string; icon: typeof User; group: 'Account' | 'Workspace' }[] = [
  { id: 'profile', label: 'Profile', icon: User, group: 'Account' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'Account' },
  { id: 'general', label: 'General', icon: LayoutGrid, group: 'Workspace' },
  { id: 'members', label: 'Members', icon: Users, group: 'Workspace' },
]

export function SettingsShell({ slug, page, children }: { slug: string; page: SettingsPage; children: ReactNode }) {
  const ws = useWorkspace(slug)
  const { user } = useSession()
  const theme = useUi((s) => s.theme)
  const setTheme = useUi((s) => s.setTheme)
  const dark = isDark(theme)
  const link = (p: (typeof PAGES)[number], cls: string) => (
    <Link key={p.id} className={cls} to={`/w/$ws/settings/${p.id}`} params={{ ws: slug }} aria-current={page === p.id ? 'page' : undefined}>
      {cls === 'nav-item' && <I icon={p.icon} />}
      {p.label}
      {cls === 'nav-item' && p.id === 'members' && <span className="n">{ws.members.length}</span>}
    </Link>
  )
  return (
    <div className="app">
      <nav className="side set-nav" aria-label="Settings">
        <div className="ws">
          <Mark flag={user.ink} />
          <span>
            <span className="ws-name">Settings</span>
            <span className="ws-sub">{ws.name}</span>
          </span>
        </div>
        <Link className="back" to="/w/$ws/my-tasks" params={{ ws: slug }}>
          <I icon={ChevronLeft} />
          Back to My tasks
        </Link>
        {(['Account', 'Workspace'] as const).map((g) => (
          <div key={g}>
            <div className="group-label">{g}</div>
            {PAGES.filter((p) => p.group === g).map((p) => link(p, 'nav-item'))}
          </div>
        ))}
        <div className="side-foot">
          <div className="me">
            <Avatar ink={user.ink} initials={user.initials} />
            <span className="who">{user.name}</span>
            <button
              className="icon-btn"
              type="button"
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={() => setTheme(dark ? 'light' : 'dark')}
            >
              <I icon={dark ? Sun : Moon} />
            </button>
          </div>
        </div>
      </nav>
      <main className="main scroll">
        <div className="set-main">
          <nav className="set-tabs" aria-label="Settings pages">
            <Link className="back-pill" to="/w/$ws/my-tasks" params={{ ws: slug }} aria-label="Back to My tasks">
              <I icon={ChevronLeft} />
            </Link>
            {PAGES.map((p) => link(p, ''))}
          </nav>
          <div className="set-col">{children}</div>
        </div>
      </main>
    </div>
  )
}

export function Section({ id, title, text, children }: { id: string; title: string; text: ReactNode; children: ReactNode }) {
  return (
    <section className="sec" aria-labelledby={id}>
      <div className="sec-l">
        <h2 id={id}>{title}</h2>
        <p>{text}</p>
      </div>
      {children}
    </section>
  )
}
