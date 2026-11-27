// Small hand-written client for /api/v1 until orval generates one from the Go OpenAPI spec (step 6.4).

export class ApiError extends Error {
  readonly status: number
  readonly detail: string
  constructor(status: number, title: string, detail: string) {
    super(title)
    this.status = status
    this.detail = detail
  }
}

const BASE = '/api/v1'

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init
  const res = await fetch(new URL(BASE + path, location.origin), {
    credentials: 'same-origin',
    ...rest,
    headers: { ...(json === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    body: json === undefined ? rest.body : JSON.stringify(json),
  })
  if (res.status === 204) return undefined as T
  const body: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    // RFC 9457 problem+json
    const p = (body ?? {}) as { title?: string; detail?: string }
    throw new ApiError(res.status, p.title ?? res.statusText, p.detail ?? '')
  }
  return body as T
}
