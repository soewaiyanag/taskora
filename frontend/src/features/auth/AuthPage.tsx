import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, CircleAlert } from 'lucide-react'
import { ApiError } from '@/api/client'
import { loginSchema, MIN_PASSWORD, signupSchema, type LoginInput, type SignupInput } from '@/api/schemas'
import type { Session } from '@/api/types'
import { I, Lockup } from '@/components/ui/glyphs'
import { toast } from '@/stores/ui'
import { useDemo, useLogin, useSignup } from './api'

const STRONG_AT = 16

function landing(s: Session) {
  const ws = s.workspaces[0]
  return ws ? `/w/${ws.slug}` : '/'
}

function Shell({
  switchText,
  switchLink,
  switchTo,
  children,
}: {
  switchText: string
  switchLink: string
  switchTo: '/login' | '/signup'
  children: ReactNode
}) {
  return (
    <main className="auth">
      <div className="auth-top">
        <Lockup href="/login" />
        <p>
          <span>{switchText}</span>
          <Link to={switchTo}>{switchLink}</Link>
        </p>
      </div>
      <div className="auth-form-col">{children}</div>
      <p className="auth-foot">Taskora is a portfolio project. The demo uses sample people and tasks.</p>
    </main>
  )
}

function DemoRow() {
  const demo = useDemo()
  const navigate = useNavigate()
  return (
    <p className="demo-row">
      <span>Just looking around?</span>
      <button
        className="demo-link"
        type="button"
        disabled={demo.isPending}
        onClick={() =>
          demo.mutate(undefined, {
            onSuccess: (s) => {
              toast('Opening the sample workspace as Mai')
              void navigate({ to: landing(s) })
            },
            onError: () => toast('The demo didn’t open. Try again.'),
          })
        }
      >
        {demo.isPending ? 'Opening the demo…' : 'Explore the demo workspace'} <I icon={ArrowRight} />
      </button>
    </p>
  )
}

/** Validate on blur once a field holds something, then live while it is wrong; never while typing a first time. */
function useFieldRules<T extends FieldValues>(form: UseFormReturn<T>) {
  return (name: Path<T>) =>
    form.register(name, {
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value) void form.trigger(name)
      },
      onChange: () => {
        if (form.formState.errors[name]) void form.trigger(name)
      },
    })
}

function Field({ id, label, error, children, hint }: { id: string; label: string; error?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className={`field${error ? ' err' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <span className="msg" id={`${id}-msg`}>
          <I icon={CircleAlert} />
          {error}
        </span>
      ) : (
        hint
      )}
    </div>
  )
}

function Password({
  id,
  autoComplete,
  describedBy,
  invalid,
  reg,
}: {
  id: string
  autoComplete: string
  describedBy: string
  invalid: boolean
  reg: ReturnType<UseFormReturn['register']>
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="with-btn">
      <input
        className="input"
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        {...reg}
      />
      <button type="button" aria-controls={id} aria-pressed={show} onClick={() => setShow((v) => !v)}>
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

function Banner({ text, focusKey }: { text: string; focusKey: number }) {
  const ref = useRef<HTMLDivElement>(null)
  // server answers take focus; a client-side summary leaves it on the first wrong field
  useEffect(() => {
    if (focusKey) ref.current?.focus()
  }, [focusKey])
  return (
    <div className="banner" role="alert" tabIndex={-1} ref={ref}>
      <I icon={CircleAlert} />
      <span>{text}</span>
    </div>
  )
}

export function LoginPage() {
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const field = useFieldRules(form)
  const login = useLogin()
  const navigate = useNavigate()
  const [banner, setBanner] = useState<{ text: string; n: number } | null>(null)
  const e = form.formState.errors

  return (
    <Shell switchText="New to Taskora?" switchLink="Create an account" switchTo="/signup">
      <h1>Log in to Taskora</h1>
      <p className="lead">Your board is right where your team left it.</p>
      <form
        className="auth-form"
        noValidate
        onSubmit={form.handleSubmit((v) => {
          setBanner(null)
          login.mutate(v, {
            onSuccess: (s) => void navigate({ to: landing(s) }),
            onError: (err) =>
              setBanner({
                text: err instanceof ApiError && err.detail ? err.detail : 'Couldn’t reach Taskora. Check your connection and try again.',
                n: Date.now(),
              }),
          })
        })}
      >
        {banner && <Banner text={banner.text} focusKey={banner.n} />}
        <Field id="li-email" label="Email" error={e.email?.message}>
          <input
            className="input"
            id="li-email"
            type="email"
            autoComplete="username"
            inputMode="email"
            placeholder="you@company.com"
            aria-describedby="li-email-msg"
            aria-invalid={!!e.email}
            {...field('email')}
          />
        </Field>
        <Field id="li-pw" label="Password" error={e.password?.message}>
          <Password
            id="li-pw"
            autoComplete="current-password"
            describedBy="li-pw-msg"
            invalid={!!e.password}
            reg={field('password') as never}
          />
        </Field>
        <button className="btn btn-primary block" type="submit" disabled={login.isPending}>
          {login.isPending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <DemoRow />
    </Shell>
  )
}

export function SignupPage() {
  const form = useForm<SignupInput>({ resolver: zodResolver(signupSchema), defaultValues: { name: '', email: '', password: '' } })
  const field = useFieldRules(form)
  const signup = useSignup()
  const navigate = useNavigate()
  const [banner, setBanner] = useState<{ text: string; n: number } | null>(null)
  const e = form.formState.errors
  const pw = form.watch('password')
  const level = pw.length >= STRONG_AT ? 3 : pw.length >= MIN_PASSWORD ? 2 : pw.length > 0 ? 1 : 0
  const left = MIN_PASSWORD - pw.length
  const hint =
    pw.length === 0
      ? `At least ${MIN_PASSWORD} characters.`
      : left > 0
        ? `${left} more character${left === 1 ? '' : 's'}.`
        : 'Good. Longer is stronger.'

  return (
    <Shell switchText="Already have an account?" switchLink="Log in" switchTo="/login">
      <h1>Create your account</h1>
      <p className="lead">Free, and ready in under a minute.</p>
      <form
        className="auth-form"
        noValidate
        onSubmit={form.handleSubmit(
          (v) => {
            setBanner(null)
            signup.mutate(v, {
              onSuccess: (s) => {
                toast(`Welcome, ${s.user.name.split(/\s+/)[0]}`)
                void navigate({ to: landing(s) })
              },
              onError: (err) =>
                setBanner({
                  text: err instanceof ApiError && err.detail ? err.detail : 'Couldn’t create the account. Try again.',
                  n: Date.now(),
                }),
            })
          },
          () => setBanner({ text: 'Fix the fields marked below, then create your account.', n: 0 }),
        )}
      >
        {banner && <Banner text={banner.text} focusKey={banner.n} />}
        <Field id="su-name" label="Full name" error={e.name?.message}>
          <input
            className="input"
            id="su-name"
            autoComplete="name"
            aria-describedby="su-name-msg"
            aria-invalid={!!e.name}
            {...field('name')}
          />
        </Field>
        <Field id="su-email" label="Work email" error={e.email?.message}>
          <input
            className="input"
            id="su-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@company.com"
            aria-describedby="su-email-msg"
            aria-invalid={!!e.email}
            {...field('email')}
          />
        </Field>
        <Field
          id="su-pw"
          label="Password"
          error={e.password?.message}
          hint={
            <span className="hint" id="pw-hint" aria-live="polite">
              {hint}
            </span>
          }
        >
          <Password
            id="su-pw"
            autoComplete="new-password"
            describedBy="pw-hint su-pw-msg"
            invalid={!!e.password}
            reg={field('password') as never}
          />
          <div className="pw-meter" aria-hidden="true">
            {[0, 1, 2].map((k) => (
              <i key={k} className={k < level ? 'on' : ''} />
            ))}
          </div>
        </Field>
        <button className="btn btn-primary block" type="submit" disabled={signup.isPending}>
          {signup.isPending ? 'Creating your account…' : 'Create account'}
        </button>
        <p className="fine">We’ll set up a workspace for you. Invite your team once you’re in.</p>
      </form>
      <DemoRow />
    </Shell>
  )
}
