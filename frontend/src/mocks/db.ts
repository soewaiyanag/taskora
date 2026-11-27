import { DB_VERSION, seed, type Db } from './seed'

// The mock "database" lives in localStorage so the demo keeps its state across reloads.
const DB_KEY = 'taskora-mock-db'
const SESSION_KEY = 'taskora-mock-session'

let db: Db | null = null

export function getDb(): Db {
  if (db) return db
  try {
    const raw = localStorage.getItem(DB_KEY)
    const parsed = raw ? (JSON.parse(raw) as Db) : null
    db = parsed?.version === DB_VERSION ? parsed : seed()
  } catch {
    db = seed()
  }
  return db
}

export function save() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(getDb()))
  } catch {
    // storage full or blocked: the demo keeps working in memory
  }
}

export function resetDb() {
  db = seed()
  save()
}

export function sessionUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}
export function setSession(userId: string | null) {
  try {
    if (userId) localStorage.setItem(SESSION_KEY, userId)
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore: the session then lasts until reload
  }
}
