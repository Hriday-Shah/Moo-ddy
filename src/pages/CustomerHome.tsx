import '@lottiefiles/dotlottie-wc'
import { useEffect, useMemo, useState } from 'react'
import { useProducts, type Product } from '../data/products'
import { getCustomerByEmail } from '../data/auth'
import { addOrder, type PaymentMethod } from '../data/orders'
import { getSession } from '../data/session'

type CartLine = {
  product: Product
  qty: number
}

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function CustomerHome() {
  const products = useProducts()
  const session = useMemo(() => getSession(), [])
  const customer = useMemo(
    () => (session.customerEmail ? getCustomerByEmail(session.customerEmail) : null),
    [session.customerEmail],
  )

  const [cart, setCart] = useState<Record<string, CartLine>>({})
  const [activeTab, setActiveTab] = useState<'items' | 'cart'>('items')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card')
  const [selectedCardId, setSelectedCardId] = useState<string>('card_1')
  const [upiId, setUpiId] = useState('')
  const [address, setAddress] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [phrases, setPhrases] = useState<string[]>([])
  const [phraseIdx, setPhraseIdx] = useState(0)

  const lines = useMemo(() => Object.values(cart).filter((l) => l.qty > 0), [cart])
  const totalQty = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines])
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * l.product.priceInr, 0),
    [lines],
  )

  const cards = useMemo(
    () => [
      { id: 'card_1', label: 'HDFC •••• 4821' },
      { id: 'card_2', label: 'SBI •••• 1094' },
      { id: 'card_3', label: 'ICICI •••• 7730' },
    ],
    [],
  )

  useEffect(() => {
    if (!customer?.email) return
    const key = `dairy.address.${customer.email.toLowerCase()}`
    const stored = window.localStorage.getItem(key)
    if (stored) setAddress(stored)
  }, [customer?.email])

  useEffect(() => {
    let cancelled = false
    fetch('/phrases.txt')
      .then((r) => (r.ok ? r.text() : ''))
      .then((txt) => {
        if (cancelled) return
        const next = txt
          .split(/\r?\n/g)
          .map((l) => l.trim())
          .filter(Boolean)
        setPhrases(next)
        setPhraseIdx(0)
      })
      .catch(() => {
        // If file is missing, just show nothing.
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (phrases.length <= 1) return
    const t = window.setInterval(() => {
      setPhraseIdx((i) => (i + 1) % phrases.length)
    }, 5 * 60 * 1000)
    return () => window.clearInterval(t)
  }, [phrases.length])

  useEffect(() => {
    if (!orderPlaced) return
    const t = window.setTimeout(() => {
      setCheckoutOpen(false)
      setActiveTab('items')
      setOrderPlaced(false)
    }, 7000)
    return () => window.clearTimeout(t)
  }, [orderPlaced])

  const saveAddress = (next: string) => {
    setAddress(next)
    if (!customer?.email) return
    const key = `dairy.address.${customer.email.toLowerCase()}`
    window.localStorage.setItem(key, next)
  }

  const setQty = (product: Product, nextQty: number) => {
    setCart((prev) => {
      const qty = Math.max(0, Math.floor(nextQty))
      if (qty <= 0) {
        const { [product.id]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [product.id]: { product, qty } }
    })
  }

  const addOne = (product: Product) => {
    setCart((prev) => {
      const current = prev[product.id]?.qty ?? 0
      return { ...prev, [product.id]: { product, qty: current + 1 } }
    })
  }

  const decOne = (product: Product) => {
    setQty(product, (cart[product.id]?.qty ?? 0) - 1)
  }

  return (
    <div className="min-h-dvh bg-[#66CCFF] text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-sky-200/70 bg-[#66CCFF]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <img
              src="/mooo-dy.png"
              alt="mooo-dy"
              className="h-10 w-auto sm:h-12"
              onError={(e) => {
                const img = e.currentTarget
                if (img.src.includes('/mooo-dy.png')) {
                  img.src = '/logo%20of%20mooo-dy.png'
                  return
                }
                img.style.display = 'none'
              }}
            />
          </div>
          <div className="text-center sm:text-center">
            <div className="text-lg font-black tracking-tight sm:text-xl">Mooo-dy dairy</div>
          </div>

          <div className="flex items-center justify-start gap-2 sm:justify-end">
            <div className="flex rounded-full border border-sky-200/70 bg-sky-50/70 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('items')}
                className={[
                  'rounded-full px-3 py-1 text-xs font-black tracking-wide transition',
                  activeTab === 'items'
                    ? 'bg-white text-zinc-950'
                    : 'text-sky-900/70 hover:text-sky-950',
                ].join(' ')}
              >
                Items
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('cart')
                  setCheckoutOpen(false)
                  setOrderPlaced(false)
                }}
                className={[
                  'rounded-full px-3 py-1 text-xs font-black tracking-wide transition',
                  activeTab === 'cart'
                    ? 'bg-white text-zinc-950'
                    : 'text-sky-900/70 hover:text-sky-950',
                ].join(' ')}
              >
                Cart {totalQty > 0 ? `(${totalQty})` : ''}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {phrases.length > 0 ? (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <div className="mt-1 text-sm font-black tracking-tight text-zinc-950">
              {phrases[phraseIdx] ?? ''}
            </div>
          </div>
        ) : null}

        <div className="grid gap-6">
          <section className={activeTab === 'items' ? 'block' : 'hidden'}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Items</h2>
                <p className="mt-1 text-sm text-zinc-950">
                  Tap an item to add it to your cart.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const qty = cart[p.id]?.qty ?? 0
                return (
                  <div
                    key={p.id}
                    className="group relative overflow-hidden rounded-2xl border border-sky-200/60 bg-white/70"
                  >
                    <button
                      type="button"
                      onClick={() => addOne(p)}
                      className="block w-full text-left"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/30">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover opacity-95 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-100"
                          onError={(e) => {
                            const img = e.currentTarget
                            img.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                      </div>

                      <div className="px-4 pb-2 pt-3">
                        <div className="truncate text-base font-black tracking-tight text-zinc-900">
                          {p.name}
                        </div>
                        <div className="mt-0.5 text-sm font-bold tracking-wide text-zinc-700">
                          {formatInr(p.priceInr)}
                        </div>
                      </div>
                    </button>

                    {p.imageCredit ? (
                      <p className="px-4 text-[10px] font-semibold leading-snug text-zinc-600">
                        {p.imageCredit}
                      </p>
                    ) : null}

                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="text-xs font-semibold text-zinc-700">
                        Qty: <span className="font-black text-zinc-900">{qty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decOne(p)}
                          disabled={qty <= 0}
                          className={[
                            'h-9 w-9 rounded-xl border text-sm font-black transition',
                            qty <= 0
                              ? 'cursor-not-allowed border-sky-200 bg-white/40 text-zinc-400'
                              : 'border-sky-200 bg-white/60 text-zinc-900 hover:border-sky-300 hover:bg-white',
                          ].join(' ')}
                          aria-label={`Decrease ${p.name} quantity`}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          onClick={() => addOne(p)}
                          className="h-9 w-9 rounded-xl border border-sky-200 bg-white/60 text-sm font-black text-zinc-900 transition hover:border-sky-300 hover:bg-white"
                          aria-label={`Increase ${p.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <aside className={activeTab === 'cart' ? 'block' : 'hidden'}>
            <div className="mx-auto w-full max-w-2xl rounded-2xl border border-sky-200/60 bg-white/70 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Cart</h2>
                  <p className="mt-1 text-sm text-zinc-700">Itemized bill</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCart({})}
                  disabled={lines.length === 0}
                  className={[
                    'rounded-xl border px-3 py-2 text-xs font-black tracking-wider transition',
                    lines.length === 0
                      ? 'cursor-not-allowed border-sky-200 bg-white/40 text-zinc-400'
                      : 'border-sky-200 bg-white/60 text-zinc-900 hover:border-sky-300 hover:bg-white',
                  ].join(' ')}
                >
                  CLEAR
                </button>
              </div>

              {lines.length === 0 ? (
                <div className="mt-5 rounded-xl border border-sky-200/60 bg-sky-50 p-4 text-sm text-zinc-600">
                  Your cart is empty. Go to <span className="font-black">Items</span> and tap an
                  item to add it.
                </div>
              ) : (
                <>
                  <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
                    {lines.map((l) => (
                      <div key={l.product.id} className="bg-sky-50/60 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-black tracking-tight text-zinc-900">
                            {l.product.name}
                          </div>
                          <div className="mt-0.5 text-xs font-semibold text-zinc-700">
                            {formatInr(l.product.priceInr)} each
                          </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setQty(l.product, l.qty - 1)}
                              className="h-9 w-9 rounded-xl border border-sky-200 bg-white/60 text-sm font-black text-zinc-900 transition hover:border-sky-300 hover:bg-white"
                              aria-label={`Decrease ${l.product.name} quantity`}
                            >
                              −
                            </button>
                            <div className="w-10 text-center text-sm font-black">{l.qty}</div>
                            <button
                              type="button"
                              onClick={() => setQty(l.product, l.qty + 1)}
                              className="h-9 w-9 rounded-xl border border-sky-200 bg-white/60 text-sm font-black text-zinc-900 transition hover:border-sky-300 hover:bg-white"
                              aria-label={`Increase ${l.product.name} quantity`}
                            >
                              +
                            </button>
                          </div>

                          <div className="text-left text-sm font-black text-zinc-900 sm:w-24 sm:text-right">
                            {formatInr(l.qty * l.product.priceInr)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                <div className="mt-5 rounded-xl border border-sky-200/60 bg-sky-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-zinc-700">Subtotal</span>
                      <span className="font-black text-zinc-900">{formatInr(subtotal)}</span>
                    </div>
                  <div className="mt-1 text-xs font-semibold text-zinc-600">
                      Taxes/delivery will be added later.
                    </div>

                    <button
                      type="button"
                      onClick={() => setCheckoutOpen((v) => !v)}
                      className="mt-4 h-11 w-full rounded-xl bg-white text-sm font-black tracking-wide text-zinc-950 transition hover:bg-zinc-100 active:scale-[0.99]"
                    >
                      Checkout
                    </button>
                  </div>

                  {checkoutOpen ? (
                    <div className="mt-4 rounded-xl border border-sky-200/60 bg-sky-50 p-4">
                      {orderPlaced ? (
                        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-950">
                          Order placed. You can view it in the Admin “Current Orders” tab.
                        </div>
                      ) : null}

                      <div className="text-sm font-black tracking-tight text-zinc-900">
                        Choose payment method
                      </div>

                      <div className="mt-3 grid gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={[
                            'rounded-xl border px-4 py-3 text-left text-xs font-black tracking-wider transition',
                            paymentMethod === 'card'
                              ? 'border-white/20 bg-white text-zinc-950'
                              : 'border-sky-200 bg-white/60 text-zinc-900 hover:border-sky-300 hover:bg-white',
                          ].join(' ')}
                        >
                          CREDIT / DEBIT CARD
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={[
                            'rounded-xl border px-4 py-3 text-left text-xs font-black tracking-wider transition',
                            paymentMethod === 'upi'
                              ? 'border-white/20 bg-white text-zinc-950'
                              : 'border-sky-200 bg-white/60 text-zinc-900 hover:border-sky-300 hover:bg-white',
                          ].join(' ')}
                        >
                          UPI
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={[
                            'rounded-xl border px-4 py-3 text-left text-xs font-black tracking-wider transition',
                            paymentMethod === 'cod'
                              ? 'border-white/20 bg-white text-zinc-950'
                              : 'border-sky-200 bg-white/60 text-zinc-900 hover:border-sky-300 hover:bg-white',
                          ].join(' ')}
                        >
                          CASH ON DELIVERY
                        </button>
                      </div>

                      {paymentMethod === 'card' ? (
                        <div className="mt-4 rounded-xl border border-sky-200/60 bg-white/60 p-3">
                          <div className="text-xs font-black tracking-wider text-zinc-900">
                            SELECT A CARD
                          </div>
                          <div className="mt-2 grid gap-2">
                            {cards.map((c) => (
                              <label
                                key={c.id}
                                className="flex cursor-pointer items-center justify-between rounded-xl border border-sky-200/60 bg-white/60 px-3 py-2 text-sm text-zinc-900 hover:border-sky-300"
                              >
                                <span className="font-semibold">{c.label}</span>
                                <input
                                  type="radio"
                                  name="card"
                                  checked={selectedCardId === c.id}
                                  onChange={() => setSelectedCardId(c.id)}
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {paymentMethod === 'upi' ? (
                        <div className="mt-4 rounded-xl border border-sky-200/60 bg-white/60 p-3">
                          <div className="text-xs font-black tracking-wider text-zinc-900">UPI ID</div>
                          <input
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="name@bank"
                            className="mt-2 h-11 w-full rounded-xl border border-sky-200/60 bg-white/60 px-3 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-sky-300 focus:bg-white"
                          />
                          <div className="mt-2 text-xs font-semibold text-zinc-600">
                            Example:{' '}
                            <span className="font-black text-zinc-900">rahul@upi</span>
                          </div>
                        </div>
                      ) : null}

                      {paymentMethod === 'cod' ? (
                        <div className="mt-4 rounded-xl border border-sky-200/60 bg-white/60 p-3 text-sm text-zinc-700">
                          Pay with cash when the delivery arrives.
                        </div>
                      ) : null}

                      <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-3">
                        <div className="text-xs font-black tracking-wider text-zinc-900">
                          DELIVERY ADDRESS
                        </div>
                        <textarea
                          value={address}
                          onChange={(e) => saveAddress(e.target.value)}
                          placeholder="House/Flat, Street, Area, City, Pincode"
                          className="mt-2 min-h-[96px] w-full resize-y rounded-xl border border-sky-200/60 bg-white/70 px-3 py-2 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-sky-300 focus:bg-white"
                        />
                        <div className="mt-2 text-xs font-semibold text-zinc-600">
                          We’ll remember this address for next time.
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={
                          (paymentMethod === 'upi' ? upiId.trim().length < 3 : false) ||
                          address.trim().length < 8 ||
                          !customer
                        }
                        className={[
                          'mt-4 h-11 w-full rounded-xl text-sm font-black tracking-wide transition active:scale-[0.99]',
                          (paymentMethod === 'upi' && upiId.trim().length < 3) ||
                          address.trim().length < 8 ||
                          !customer
                            ? 'cursor-not-allowed bg-white/20 text-zinc-500'
                            : 'bg-white text-zinc-950 hover:bg-zinc-100',
                        ].join(' ')}
                        onClick={() => {
                          if (!customer) return
                          const method: PaymentMethod = paymentMethod
                          const paymentDetail =
                            method === 'card'
                              ? cards.find((c) => c.id === selectedCardId)?.label
                              : method === 'upi'
                                ? upiId.trim()
                                : undefined

                          addOrder({
                            customerName: customer.name,
                            customerEmail: customer.email,
                            address: address.trim(),
                            paymentMethod: method,
                            paymentDetail,
                            subtotalInr: subtotal,
                            lines: lines.map((l) => ({
                              productId: l.product.id,
                              name: l.product.name,
                              priceInr: l.product.priceInr,
                              qty: l.qty,
                              lineTotalInr: l.qty * l.product.priceInr,
                            })),
                          })
                          setCart({})
                          setOrderPlaced(true)
                        }}
                      >
                        Place order
                      </button>

                      {!customer ? (
                        <div className="mt-3 text-xs font-semibold text-zinc-700">
                          You must be signed in as a customer to place an order.
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </aside>
        </div>
      </main>

      {orderPlaced ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 p-6 text-center">
            <div className="mx-auto w-full max-w-[260px]">
              <dotlottie-wc
                src="/animations/Cow%20Drink%20Milk.lottie"
                autoplay
                loop
                style={{ width: '100%', height: '260px' }}
              />
            </div>
            <div className="mt-2 text-base font-black tracking-tight text-zinc-50">
              We’re mooo-ving fast! Your order is on its way.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

