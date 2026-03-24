import { useEffect, useMemo, useState } from 'react'

export type Product = {
  id: string
  name: string
  priceInr: number
  imageUrl: string
  /** Shown on the customer shop under the product image (e.g. photo credit). */
  imageCredit?: string
  createdAt: number
}

const STORAGE_KEY = 'dairy.products.v1'
const EVENT_NAME = 'dairy-products-changed'

const SEED_PRODUCTS: Product[] = [
  {
    id: 'seed-cheese',
    name: 'Cheese',
    priceInr: 50,
    imageUrl: '/items/cheese.jpg',
    createdAt: Date.now(),
  },
  {
    id: 'seed-milk-carton',
    name: 'Milk Carton',
    priceInr: 40,
    imageUrl: '/items/milk-carton.jpg',
    createdAt: Date.now(),
  },
]

function safeParse(json: string | null): Product[] | null {
  if (!json) return null
  try {
    const parsed = JSON.parse(json) as unknown
    if (!Array.isArray(parsed)) return null
    return parsed as Product[]
  } catch {
    return null
  }
}

export function getProducts(): Product[] {
  if (typeof window === 'undefined') return SEED_PRODUCTS

  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY))
  if (stored && stored.length > 0) return stored

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS))
  return SEED_PRODUCTS
}

function setProducts(next: Product[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(EVENT_NAME))
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

export class DuplicateProductNameError extends Error {
  constructor() {
    super('A product with that name already exists.')
    this.name = 'DuplicateProductNameError'
  }
}

export function addProduct(input: Omit<Product, 'id' | 'createdAt'>) {
  const products = getProducts()
  const normalized = normalizeName(input.name)
  if (products.some((p) => normalizeName(p.name) === normalized)) {
    throw new DuplicateProductNameError()
  }
  const id = `p_${crypto.randomUUID()}`
  const next: Product = { ...input, id, createdAt: Date.now() }
  setProducts([next, ...products])
}

export function removeProduct(productId: string) {
  const products = getProducts()
  setProducts(products.filter((p) => p.id !== productId))
}

export function updateProductImageCredit(productId: string, imageCredit: string) {
  const products = getProducts()
  const idx = products.findIndex((p) => p.id === productId)
  if (idx < 0) return
  const trimmed = imageCredit.trim()
  const prev = products[idx]
  const nextProduct: Product = { ...prev }
  if (trimmed) nextProduct.imageCredit = trimmed
  else delete nextProduct.imageCredit
  const next = [...products]
  next[idx] = nextProduct
  setProducts(next)
}

export function useProducts() {
  const [products, setState] = useState<Product[]>(() => getProducts())

  useEffect(() => {
    const onChange = () => setState(getProducts())
    window.addEventListener(EVENT_NAME, onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener(EVENT_NAME, onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  const sorted = useMemo(
    () => [...products].sort((a, b) => b.createdAt - a.createdAt),
    [products],
  )

  return sorted
}

