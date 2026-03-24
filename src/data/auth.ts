export type CustomerAccount = {
  email: string
  password: string
  name: string
  createdAt: number
}

const STORAGE_KEY = 'dairy.customers.v1'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function safeParse(json: string | null): CustomerAccount[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed as CustomerAccount[]
  } catch {
    return []
  }
}

export class DuplicateEmailError extends Error {
  constructor() {
    super('That email is already registered.')
    this.name = 'DuplicateEmailError'
  }
}

export function getCustomers(): CustomerAccount[] {
  if (typeof window === 'undefined') return []
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

export function getCustomerByEmail(email: string): CustomerAccount | null {
  const customers = getCustomers()
  const normalized = normalizeEmail(email)
  return customers.find((c) => normalizeEmail(c.email) === normalized) ?? null
}

function setCustomers(next: CustomerAccount[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function registerCustomer(input: { name: string; email: string; password: string }) {
  const customers = getCustomers()
  const email = normalizeEmail(input.email)
  if (customers.some((c) => normalizeEmail(c.email) === email)) {
    throw new DuplicateEmailError()
  }
  const next: CustomerAccount = {
    name: input.name.trim(),
    email,
    password: input.password,
    createdAt: Date.now(),
  }
  setCustomers([next, ...customers])
}

export function validateCustomerLogin(email: string, password: string): string | null {
  const customers = getCustomers()
  const match = customers.find((c) => normalizeEmail(c.email) === normalizeEmail(email))
  if (!match) return 'Account not found. Please sign up.'
  if (match.password !== password) return 'Incorrect password.'
  return null
}

