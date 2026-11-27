import { useState } from 'react'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, CircleAlert, Copy, Ellipsis, Inbox, Mail } from 'lucide-react'
import { api, ApiError } from '@/api/client'
import { inviteSchema, prefixSchema, profileSchema, workspaceNameSchema, type ProfileInput } from '@/api/schemas'
import type { NotificationPref, Role } from '@/api/types'
import { Avatar, I, Mark, Select, Switch, inkStyle } from '@/components/ui/glyphs'
import { useLogout, useUpdateProfile } from '@/features/auth/api'
import { useSession } from '@/features/shell/AppShell'
import {
  invitesQuery,
  useDeleteWorkspace,
  useInvite,
  useRenameWorkspace,
  useResetLink,
  useRevokeInvite,
  useSetPrefix,
  useSetRole,
  useWorkspace,
} from '@/features/workspace/api'
import { ago, shortDate } from '@/lib/dates'
import { keys } from '@/lib/query'
import { toast, useUi, type Theme } from '@/stores/ui'
import { Section } from './SettingsShell'

const initials = (v: string) => {
  const p = v.trim().split(/\s+/).filter(Boolean)
  return p.length ? ((p[0]?.[0] ?? '') + (p.length > 1 ? (p[p.length - 1]?.[0] ?? '') : '')).toUpperCase() : '?'
}
const errText = (e: unknown, fallback: string) => (e instanceof ApiError && (e.detail || e.message)) || fallback

/* ---------- Profile ---------- */
export function ProfilePage({ slug }: { slug: string }) {
  const ws = useWorkspace(slug)
  const { user } = useSession()
  const save = useUpdateProfile()
  const logout = useLogout()
  const navigate = useNavigate()
  const theme = useUi((s) => s.theme)
  const setTheme = useUi((s) => s.setTheme)
  const form = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), values: { name: user.name, email: user.email } })
  const name = form.watch('name')
  const dirty = form.formState.isDirty
  const e = form.formState.errors
  const others = ws.members.length - 1

  return (
    <>
      <header className="set-head">
        <h1>Profile</h1>
        <p>
          {others > 0
            ? `How you appear to the ${others} other ${others === 1 ? 'person' : 'people'} in ${ws.name}.`
            : `How you’ll appear to the people you invite to ${ws.name}.`}
        </p>
      </header>
      <Section id="h-seen" title="How your team sees you" text="Your initials and ink mark every card you own and every comment you write.">
        <div className="preview" aria-live="polite">
          <div className="pv-row">
            <div className="pv-card" style={inkStyle(user.ink)}>
              <span className="flag" aria-hidden="true" />
              <span className="code">WEB-142</span>
              <div className="t">Redesign the onboarding checklist</div>
              <span className="rail" aria-hidden="true">
                <span className="bar" style={{ left: '30%', width: '34%' }} />
                <span className="today" style={{ left: '44%' }} />
              </span>
              <div className="f">
                <span>Nov 18</span>
                <Avatar ink={user.ink} initials={initials(name)} />
              </div>
            </div>
            <span className="pv-key">
              <Avatar ink={user.ink} initials={initials(name)} online />
              <span>
                <b>{name.trim() || 'Your name'}</b> · online
              </span>
            </span>
          </div>
        </div>
      </Section>
      <Section id="h-you" title="Name and email" text="Your email is how you log in, and where email notifications go.">
        <form
          className="sheet"
          noValidate
          onSubmit={form.handleSubmit((v) =>
            save.mutate(v, {
              onSuccess: () => {
                form.reset(v)
                toast('Profile saved')
              },
              onError: (err) => toast(errText(err, 'Couldn’t save your profile. Try again.')),
            }),
          )}
        >
          <div className="srow">
            <label htmlFor="p-name">Full name</label>
            <div className={`v field${e.name ? ' err' : ''}`}>
              <input className="input" id="p-name" autoComplete="name" aria-invalid={!!e.name} {...form.register('name')} />
              {e.name && (
                <span className="msg">
                  <I icon={CircleAlert} />
                  {e.name.message}
                </span>
              )}
            </div>
          </div>
          <div className="srow">
            <label htmlFor="p-email">Email</label>
            <div className={`v field${e.email ? ' err' : ''}`}>
              <input
                className="input"
                id="p-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!e.email}
                {...form.register('email')}
              />
              {e.email && (
                <span className="msg">
                  <I icon={CircleAlert} />
                  {e.email.message}
                </span>
              )}
            </div>
          </div>
          <div className="sheet-f">
            <span className="note-s">{dirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
            <button className="btn sm" type="button" disabled={!dirty} onClick={() => form.reset()}>
              Discard
            </button>
            <button className="btn btn-primary sm" type="submit" disabled={!dirty || save.isPending}>
              {save.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </Section>
      <Section id="h-theme" title="Appearance" text="Saved on this device. System follows your computer’s light or dark setting.">
        <div className="themes" role="radiogroup" aria-labelledby="h-theme">
          {(['light', 'dark', 'system'] as Theme[]).map((t) => (
            <button key={t} className="theme-opt" type="button" role="radio" aria-checked={theme === t} onClick={() => setTheme(t)}>
              <span className={`room ${t}`} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="lbl">
                {t[0]!.toUpperCase() + t.slice(1)}
                <I icon={Check} />
              </span>
            </button>
          ))}
        </div>
      </Section>
      <Section id="h-sec" title="Security" text="Sessions renew while you use Taskora and end when you log out.">
        <div className="sheet">
          <div className="srow">
            <span className="k">Password</span>
            <div className="v">
              <button className="btn sm" type="button" onClick={() => toast('Changing your password is coming soon.')}>
                Change password<span className="soon">Soon</span>
              </button>
            </div>
          </div>
          <div className="srow">
            <span className="k">Session</span>
            <div className="v">
              <button
                className="btn sm"
                type="button"
                disabled={logout.isPending}
                onClick={() => logout.mutate(undefined, { onSuccess: () => void navigate({ to: '/login' }) })}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ---------- Notifications ---------- */
const prefsQuery = queryOptions({ queryKey: keys.prefs, queryFn: () => api<NotificationPref[]>('/me/notification-prefs') })

export function NotificationsPage() {
  const { user } = useSession()
  const qc = useQueryClient()
  const { data: prefs } = useQuery(prefsQuery)
  const set = useMutation({
    mutationFn: (v: { id: string; inbox?: boolean; email?: boolean }) =>
      api<NotificationPref[]>(`/me/notification-prefs/${v.id}`, { method: 'PATCH', json: v }),
    onMutate: (v) => {
      const prev = qc.getQueryData<NotificationPref[]>(keys.prefs)
      qc.setQueryData<NotificationPref[]>(keys.prefs, (old) => old?.map((p) => (p.id === v.id ? { ...p, ...v } : p)))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.prefs, ctx.prev)
      toast('Couldn’t save that setting.')
    },
    onSuccess: (p) => qc.setQueryData(keys.prefs, p),
  })
  return (
    <>
      <header className="set-head">
        <h1>Notifications</h1>
        <p>Choose what reaches your Inbox and your email. Changes save as you go.</p>
      </header>
      <Section id="h-when" title="About your tasks" text={`Inbox is at the top of the sidebar. Email goes to ${user.email}.`}>
        <div className="sheet">
          <div className="tbl-wrap">
            <table className="tbl ntbl">
              <thead>
                <tr>
                  <th>When</th>
                  <th>
                    <I icon={Inbox} />
                    Inbox
                  </th>
                  <th>
                    <I icon={Mail} />
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {(prefs ?? []).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <b>{p.label}</b>
                      <span>{p.hint}</span>
                    </td>
                    <td>
                      {p.inbox === null ? (
                        <span className="na">Email only</span>
                      ) : (
                        <Switch
                          on={p.inbox}
                          label={`${p.label} in Inbox`}
                          onToggle={() => {
                            set.mutate({ id: p.id, inbox: !p.inbox })
                            toast(`${p.inbox ? 'Off' : 'On'}: ${p.label} in Inbox`)
                          }}
                        />
                      )}
                    </td>
                    <td>
                      <Switch
                        on={p.email}
                        label={`${p.label} by email`}
                        onToggle={() => {
                          set.mutate({ id: p.id, email: !p.email })
                          toast(`${p.email ? 'Off' : 'On'}: ${p.label} by email`)
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ---------- Workspace: General ---------- */
export function GeneralPage({ slug }: { slug: string }) {
  const ws = useWorkspace(slug)
  const { user } = useSession()
  const rename = useRenameWorkspace(slug)
  const setPrefix = useSetPrefix(slug)
  const del = useDeleteWorkspace(slug)
  const navigate = useNavigate()
  const me = ws.members.find((m) => m.id === user.id)
  const canEdit = me?.role !== 'Member'
  const [name, setName] = useState(ws.name)
  const [prefixes, setPrefixes] = useState<Record<string, string>>({})
  const [confirming, setConfirming] = useState(false)
  const [typed, setTyped] = useState('')
  const v = name.trim()
  const valid = workspaceNameSchema.safeParse(v).success
  const changed = v !== ws.name
  const lists = ws.lists.length
  const tasks = ws.spaces.reduce((n, s) => n + s.taskCount, 0)

  return (
    <>
      <header className="set-head">
        <h1>General</h1>
        <p>{canEdit ? 'Only owners and admins can change these.' : 'Only owners and admins can change these. Ask one of them.'}</p>
      </header>
      <Section id="h-ws" title="Workspace name" text="Shown at the top of everyone’s sidebar and on invites.">
        <form
          className="sheet"
          onSubmit={(e) => {
            e.preventDefault()
            if (!valid || !changed) return
            rename.mutate(v, {
              onSuccess: () => toast(`Renamed to ${v}`),
              onError: (err) => toast(errText(err, 'Couldn’t rename the workspace.')),
            })
          }}
        >
          <div className="srow">
            <label htmlFor="w-name">Name</label>
            <div className="v">
              <input
                className="input"
                id="w-name"
                value={name}
                maxLength={40}
                disabled={!canEdit}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="srow">
            <span className="k">In the sidebar</span>
            <div className="v">
              <span className="sb-pv" aria-live="polite">
                <span className="ws">
                  <Mark flag={user.ink} />
                  <span>
                    <span className="ws-name">{v || 'Untitled workspace'}</span>
                    <span className="ws-sub">
                      {ws.members.length} member{ws.members.length === 1 ? '' : 's'}
                    </span>
                  </span>
                </span>
              </span>
            </div>
          </div>
          <div className="sheet-f">
            <span className="note-s">
              {!valid ? 'A workspace needs a name' : changed ? 'Unsaved changes' : `Saved ${shortDate(ws.updatedAt)}`}
            </span>
            <button className="btn btn-primary sm" type="submit" disabled={!canEdit || !valid || !changed || rename.isPending}>
              Save changes
            </button>
          </div>
        </form>
      </Section>
      <Section
        id="h-codes"
        title="Task codes"
        text="Each space has a prefix that starts its task codes. Changing it renames new tasks only."
      >
        <div className="sheet">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Space</th>
                  <th>Prefix</th>
                  <th className="hide-sm">Next code</th>
                  <th className="hide-sm">Tasks</th>
                </tr>
              </thead>
              <tbody>
                {ws.spaces.map((s) => {
                  const shown = prefixes[s.id] ?? s.prefix
                  return (
                    <tr key={s.id}>
                      <td>
                        <span className="who-cell">
                          <span className="space-mark">{s.name[0]}</span>
                          {s.name}
                        </span>
                      </td>
                      <td>
                        <input
                          className="input pfx"
                          value={shown}
                          aria-label={`${s.name} prefix`}
                          maxLength={5}
                          disabled={!canEdit}
                          onChange={(e) => setPrefixes((p) => ({ ...p, [s.id]: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                          onBlur={() => {
                            if (shown === s.prefix) return
                            if (!prefixSchema.safeParse(shown).success) {
                              setPrefixes((p) => ({ ...p, [s.id]: s.prefix }))
                              toast('A prefix needs 2 to 5 letters or digits')
                              return
                            }
                            setPrefix.mutate(
                              { spaceId: s.id, prefix: shown },
                              {
                                onSuccess: () => toast(`New tasks will use ${shown}-`),
                                onError: (err) => {
                                  setPrefixes((p) => ({ ...p, [s.id]: s.prefix }))
                                  toast(errText(err, 'Couldn’t change the prefix.'))
                                },
                              },
                            )
                          }}
                        />
                      </td>
                      <td className="hide-sm">
                        <span className="code-pv">
                          {shown || '…'}-{s.nextNumber}
                        </span>
                      </td>
                      <td className="num hide-sm">{s.taskCount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
      <Section id="h-del" title="Delete workspace" text="Only the owner can do this.">
        <div className="sheet">
          <div className="del-body">
            <p>
              Deleting removes{' '}
              <b>
                {ws.spaces.length} space{ws.spaces.length === 1 ? '' : 's'}, {lists} list{lists === 1 ? '' : 's'} and {tasks} task
                {tasks === 1 ? '' : 's'}
              </b>{' '}
              for all {ws.members.length} member{ws.members.length === 1 ? '' : 's'}. This can’t be undone.
            </p>
            {!confirming ? (
              <button className="btn sm" type="button" disabled={me?.role !== 'Owner'} onClick={() => setConfirming(true)}>
                Delete workspace…
              </button>
            ) : (
              <div className="confirm">
                <div className="field">
                  <label htmlFor="del-in">
                    Type <b>{ws.name}</b> to confirm
                  </label>
                  <input
                    className="input"
                    id="del-in"
                    autoComplete="off"
                    autoFocus
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                  />
                </div>
                <div className="acts">
                  <button
                    className="btn btn-primary sm"
                    type="button"
                    disabled={typed.trim() !== ws.name || del.isPending}
                    onClick={() =>
                      del.mutate(undefined, {
                        onSuccess: () => {
                          toast(`Deleted ${ws.name}`)
                          void navigate({ to: '/' })
                        },
                        onError: (err) => toast(errText(err, 'Couldn’t delete the workspace.')),
                      })
                    }
                  >
                    Delete {ws.name}
                  </button>
                  <button
                    className="btn sm"
                    type="button"
                    onClick={() => {
                      setConfirming(false)
                      setTyped('')
                    }}
                  >
                    Keep it
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}

/* ---------- Workspace: Members ---------- */
export function MembersPage({ slug }: { slug: string }) {
  const ws = useWorkspace(slug)
  const { user } = useSession()
  const { data: inv } = useQuery(invitesQuery(slug))
  const invite = useInvite(slug)
  const revoke = useRevokeInvite(slug)
  const reset = useResetLink(slug)
  const setRole = useSetRole(slug)
  const [email, setEmail] = useState('')
  const [role, setRoleIn] = useState<'Member' | 'Admin'>('Member')
  const [err, setErr] = useState<string | null>(null)
  const pending = inv?.invites ?? []
  const online = ws.members.filter((m) => m.online).length
  const meRole = ws.members.find((m) => m.id === user.id)?.role
  const canManage = meRole !== 'Member'
  const nameOf = (id: string) => ws.members.find((m) => m.id === id)?.name.split(' ')[0] ?? 'someone'

  const copyLink = () => {
    if (!inv) return
    const v = `https://${inv.link}`
    const fallback = () => {
      const el = document.getElementById('inv-link') as HTMLInputElement | null
      el?.select()
      toast('Press ⌘C to copy the selected link')
    }
    try {
      navigator.clipboard.writeText(v).then(() => toast('Invite link copied'), fallback)
    } catch {
      fallback()
    }
  }

  return (
    <>
      <header className="set-head">
        <h1>Members</h1>
        <p>
          {ws.members.length} member{ws.members.length === 1 ? '' : 's'} ·{' '}
          {pending.length ? `${pending.length} pending invite${pending.length === 1 ? '' : 's'}` : 'no pending invites'}
        </p>
      </header>
      <Section
        id="h-inv"
        title="Invite people"
        text="Members can see and edit every space. Admins can also change these settings and manage members."
      >
        <div className="sheet">
          <form
            className="invite"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              const parsed = inviteSchema.safeParse({ email, role })
              if (!parsed.success) {
                setErr(parsed.error.issues[0]?.message ?? 'Enter an email address to invite')
                document.getElementById('inv-email')?.focus()
                return
              }
              setErr(null)
              invite.mutate(parsed.data, {
                onSuccess: () => {
                  setEmail('')
                  toast(`Invite sent to ${parsed.data.email}`)
                },
                onError: (x) => setErr(errText(x, 'Couldn’t send the invite.')),
              })
            }}
          >
            <input
              className="input"
              id="inv-email"
              type="email"
              placeholder="name@company.com"
              aria-label="Email to invite"
              aria-invalid={!!err}
              aria-describedby={err ? 'inv-err' : undefined}
              autoComplete="off"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (err) setErr(null)
              }}
            />
            <Select aria-label="Role" value={role} onChange={(e) => setRoleIn(e.target.value as 'Member' | 'Admin')}>
              <option>Member</option>
              <option>Admin</option>
            </Select>
            <button className="btn btn-primary" type="submit" disabled={invite.isPending}>
              Send invite
            </button>
            {err && (
              <span className="field err" style={{ gridColumn: '1 / -1' }}>
                <span className="msg" id="inv-err">
                  <I icon={CircleAlert} />
                  {err}
                </span>
              </span>
            )}
          </form>
          <div className="linkbox">
            <input className="input" id="inv-link" readOnly value={inv?.link ?? ''} aria-label="Invite link" />
            <button className="btn" type="button" onClick={copyLink}>
              <I icon={Copy} />
              Copy link
            </button>
            <p>
              Anyone with the link joins as a Member.{inv ? ` It expires on ${shortDate(inv.expires)}.` : ''}{' '}
              <button
                type="button"
                onClick={() => reset.mutate(undefined, { onSuccess: () => toast('New link made. The old one stops working.') })}
              >
                Reset link
              </button>
            </p>
          </div>
        </div>
      </Section>
      <Section id="h-mem" title="Members" text={`${online} online now. The owner can’t be removed; transfer ownership first.`}>
        <div className="sheet">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Role</th>
                  <th className="hide-sm">Last active</th>
                  <th>
                    <span className="sr">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ws.members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className="who-cell">
                        <Avatar ink={m.ink} initials={m.initials} online={m.online} />
                        <span style={{ minWidth: 0 }}>
                          <b>
                            {m.name}
                            {m.id === user.id && <span className="chip you">You</span>}
                          </b>
                          <small>{m.email}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      {m.role === 'Owner' || !canManage ? (
                        <span className="muted">{m.role}</span>
                      ) : (
                        <Select
                          aria-label={`Role for ${m.name}`}
                          value={m.role}
                          onChange={(e) => {
                            const r = e.target.value as Exclude<Role, 'Owner'>
                            setRole.mutate(
                              { userId: m.id, role: r },
                              {
                                onSuccess: () => toast(`${m.name} is now ${r === 'Admin' ? 'an Admin' : 'a Member'}`),
                                onError: (x) => toast(errText(x, 'Couldn’t change the role.')),
                              },
                            )
                          }}
                        >
                          <option>Admin</option>
                          <option>Member</option>
                        </Select>
                      )}
                    </td>
                    <td className="hide-sm muted">{m.lastActive}</td>
                    <td className="end">
                      {m.id !== user.id && (
                        <button
                          className="icon-btn"
                          type="button"
                          aria-label={`More for ${m.name}`}
                          onClick={() => toast('Removing members is coming soon.')}
                        >
                          <I icon={Ellipsis} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
      <Section id="h-pend" title="Pending invites" text="Invites expire after 7 days.">
        <div className="sheet">
          {pending.length === 0 ? (
            <p className="empty-row">No pending invites. Send one above or share the link.</p>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <tbody>
                  {pending.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <span className="who-cell">
                          <span className="av ghost">{i.email.slice(0, 2).toUpperCase()}</span>
                          <span>
                            <b>{i.email}</b>
                            <small>
                              Invited by {nameOf(i.invitedBy)} as {i.role} · {ago(i.at)}
                            </small>
                          </span>
                        </span>
                      </td>
                      <td className="end">
                        <button
                          className="btn sm"
                          type="button"
                          onClick={() => revoke.mutate(i.id, { onSuccess: () => toast('Invite revoked') })}
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Section>
    </>
  )
}
