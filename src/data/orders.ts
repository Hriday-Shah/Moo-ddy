import { useEffect, useMemo, useState } from 'react'

export type OrderLine = {
  productId: string
  name: string
  priceInr: number
  qty: number
  lineTotalInr: number
}

export type PaymentMethod = 'card' | 'upi' | 'cod'
export type OrderStatus = 'pending' | 'on_the_way' | 'delivered'

export type Order = {
  id: string
  createdAt: number
  customerName: string
  customerEmail: string
  address: string
  paymentMethod: PaymentMethod
  paymentDetail?: string
  status: OrderStatus
  deliveryConfirmedAt?: number
  deliveredAt?: number
  subtotalInr: number
  lines: OrderLine[]
}

const STORAGE_KEY = 'dairy.orders.v1'
const EVENT_NAME = 'dairy-orders-changed'

function safeParse(json: string | null): Order[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json) as unknown
    if (!Array.isArray(parsed)) return []
    return (parsed as Array<Omit<Order, 'status'> & { status?: OrderStatus }>).map((o) => ({
      ...o,
      status: o.status ?? 'pending',
    }))
  } catch {
    return []
  }
}

function getOrdersRaw(): Order[] {
  if (typeof window === 'undefined') return []
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

function setOrdersRaw(next: Order[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function addOrder(input: Omit<Order, 'id' | 'createdAt' | 'status'> & { status?: OrderStatus }) {
  const orders = getOrdersRaw()
  const id = `o_${crypto.randomUUID()}`
  const next: Order = { ...input, id, createdAt: Date.now(), status: input.status ?? 'pending' }
  setOrdersRaw([next, ...orders])
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = getOrdersRaw()
  const next = orders.map((o) =>
    o.id === orderId
      ? {
          ...o,
          status,
          deliveryConfirmedAt: status === 'on_the_way' ? Date.now() : o.deliveryConfirmedAt,
          deliveredAt: status === 'delivered' ? Date.now() : o.deliveredAt,
        }
      : o,
  )
  setOrdersRaw(next)
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() => getOrdersRaw())

  useEffect(() => {
    const onChange = () => setOrders(getOrdersRaw())
    window.addEventListener(EVENT_NAME, onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener(EVENT_NAME, onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  const sorted = useMemo(() => [...orders].sort((a, b) => b.createdAt - a.createdAt), [orders])
  return sorted
}

