import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { removeProduct, updateProductImageCredit, useProducts, type Product } from '../data/products'
import { useOrders } from '../data/orders'

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function ProductImageCreditField({ product }: { product: Product }) {
  const [value, setValue] = useState(product.imageCredit ?? '')
  useEffect(() => {
    setValue(product.imageCredit ?? '')
  }, [product.id, product.imageCredit])

  return (
    <div className="border-t border-sky-200/50 px-4 py-3">
      <label className="text-[10px] font-black tracking-wider text-zinc-700" htmlFor={`img-credit-${product.id}`}>
        IMAGE CREDIT
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={`img-credit-${product.id}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Photo: name / source"
          className="min-w-0 flex-1 rounded-xl border border-sky-200/60 bg-white/60 px-3 py-2 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-sky-300 focus:bg-white"
        />
        <button
          type="button"
          onClick={() => updateProductImageCredit(product.id, value)}
          className="rounded-xl bg-white px-3 py-2 text-[10px] font-black tracking-wider text-zinc-950 transition hover:bg-zinc-100 sm:shrink-0"
        >
          SAVE
        </button>
      </div>
      <p className="mt-2 text-[10px] font-semibold text-zinc-600">
        Shown under the product image on the customer shop.
      </p>
    </div>
  )
}

export function AdminHome() {
  const products = useProducts()
  const orders = useOrders()
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')

  const totalOrders = useMemo(() => orders.length, [orders.length])

  return (
    <div className="min-h-dvh bg-[#66CCFF] text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-sky-200/70 bg-[#66CCFF]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="min-w-0">
            <div className="text-xs font-black tracking-wider text-zinc-700">ADMIN</div>
            <h1 className="truncate text-xl font-black tracking-tight">Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-black tracking-tight">Dashboard</h2>
            <p className="mt-1 text-sm text-zinc-700">
              Manage products and view current orders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-sky-200/70 bg-sky-50/70 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={[
                  'rounded-full px-3 py-2 text-xs font-black tracking-wide transition',
                  activeTab === 'products'
                    ? 'bg-white text-zinc-950'
                    : 'text-sky-900/70 hover:text-sky-950',
                ].join(' ')}
              >
                Products
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={[
                  'rounded-full px-3 py-2 text-xs font-black tracking-wide transition',
                  activeTab === 'orders'
                    ? 'bg-white text-zinc-950'
                    : 'text-sky-900/70 hover:text-sky-950',
                ].join(' ')}
              >
                Current Orders{totalOrders > 0 ? ` (${totalOrders})` : ''}
              </button>
            </div>

            {activeTab === 'products' ? (
              <Link
                to="/admin/items/new"
                className="rounded-xl bg-white px-4 py-3 text-xs font-black tracking-wider text-zinc-950 transition hover:bg-zinc-100 active:scale-[0.99]"
              >
                + ADD ITEM
              </Link>
            ) : null}
          </div>
        </div>

        {activeTab === 'products' ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-sky-200/70 bg-white/70"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/30">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="truncate text-base font-black tracking-tight">{p.name}</div>
                    <div className="mt-0.5 text-xs font-bold tracking-wide text-zinc-50">
                      {formatInr(p.priceInr)}
                    </div>
                  </div>
                  <div className="absolute right-3 top-3">
                    <button
                      type="button"
                      onClick={() => removeProduct(p.id)}
                      className="rounded-xl border border-red-200/50 bg-white/80 px-3 py-2 text-[11px] font-black tracking-wider text-zinc-950 transition hover:border-red-300 hover:bg-red-100"
                      aria-label={`Remove ${p.name}`}
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
                <ProductImageCreditField product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-sky-200/70 bg-white/70 p-6 text-sm text-zinc-700">
                No orders yet.
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-sky-200/70 bg-white/70 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-black tracking-wider text-zinc-700">
                        ORDER
                      </div>
                      <div className="mt-1 truncate text-lg font-black tracking-tight text-zinc-900">
                        {o.customerName}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-zinc-700">
                        {o.customerEmail}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-zinc-700">Total</div>
                      <div className="text-lg font-black text-zinc-900">{formatInr(o.subtotalInr)}</div>
                      <div className="mt-1 text-xs font-semibold text-zinc-700">
                        {o.paymentMethod.toUpperCase()}
                        {o.paymentDetail ? ` • ${o.paymentDetail}` : ''}
                      </div>
                      <div
                        className={[
                          'mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-black tracking-wider',
                          o.status === 'delivered'
                            ? 'bg-slate-100 text-slate-700'
                            : o.status === 'on_the_way'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800',
                        ].join(' ')}
                      >
                        {o.status === 'delivered'
                          ? 'DELIVERED'
                          : o.status === 'on_the_way'
                            ? 'ON THE WAY'
                            : 'PENDING'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl border border-sky-200/70 bg-sky-50/70 p-4">
                      <div className="text-xs font-black tracking-wider text-zinc-900">
                        ADDRESS
                      </div>
                      <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-900">
                        {o.address}
                      </div>
                    </div>

                    <div className="rounded-xl border border-sky-200/70 bg-sky-50/70 p-4">
                      <div className="text-xs font-black tracking-wider text-zinc-900">
                        ITEMISED BILL
                      </div>
                      <div className="mt-3 divide-y divide-sky-200/60 overflow-hidden rounded-xl border border-sky-200/60">
                        {o.lines.map((l) => (
                          <div
                            key={l.productId}
                            className="flex items-center gap-3 bg-sky-50/70 p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-black text-zinc-900">
                                {l.name}
                              </div>
                              <div className="text-xs font-semibold text-zinc-700">
                                {l.qty} × {formatInr(l.priceInr)}
                              </div>
                            </div>
                            <div className="text-sm font-black text-zinc-900">
                              {formatInr(l.lineTotalInr)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-semibold text-zinc-700">Total</span>
                        <span className="font-black text-zinc-900">{formatInr(o.subtotalInr)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

