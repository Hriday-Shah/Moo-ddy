const STORAGE_KEY = 'dairy.session.v1'

export type Session = {
  customerEmail: string | null
}

function safeParse(json: string | null): Session {
  if (!json) return { customerEmail: null }
  try {
    const parsed = JSON.parse(json) as unknown
    if (!parsed || typeof parsed !== 'object') return { customerEmail: null }
    const email = (parsed as { customerEmail?: unknown }).customerEmail
    return { customerEmail: typeof email === 'string' ? email : null }
  } catch {
    return { customerEmail: null }
  }
}

export function getSession(): Session {
  if (typeof window === 'undefined') return { customerEmail: null }
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

export function setCustomerSession(email: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ customerEmail: email }))
}

