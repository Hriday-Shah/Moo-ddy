import { useMemo, useState } from 'react'
import { updateOrderStatus, useOrders } from '../data/orders'

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function DeliveryHome() {
  const orders = useOrders()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locError, setLocError] = useState<string>('')

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null,
    [orders, selectedOrderId],
  )

  const pickupLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocError('')
      },
      () => {
        setLocError('Location permission denied or unavailable.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const mapSrc = selectedOrder
    ? `https://www.google.com/maps?q=${encodeURIComponent(selectedOrder.address)}&output=embed`
    : ''

  return (
    <div className="min-h-dvh bg-[#66CCFF] text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-sky-200/70 bg-[#66CCFF]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="text-xs font-black tracking-wider text-zinc-700">DELIVERY</div>
            <h1 className="text-xl font-black tracking-tight">Delivery Dashboard</h1>
          </div>

          <button
            type="button"
            onClick={pickupLocation}
            className="rounded-xl bg-white px-4 py-3 text-xs font-black tracking-wider text-zinc-950 transition hover:bg-zinc-100"
          >
            USE MY LOCATION
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="rounded-2xl border border-sky-200/70 bg-white/70 p-4 text-sm">
          {currentLocation ? (
            <span className="font-semibold">
              Current location: {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
            </span>
          ) : (
            <span className="text-zinc-700">
              Location not selected yet. Click <span className="font-black">USE MY LOCATION</span>.
            </span>
          )}
          {locError ? <div className="mt-2 text-xs font-semibold text-red-700">{locError}</div> : null}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
          <section className="rounded-2xl border border-sky-200/70 bg-white/70 p-4">
            <h2 className="text-lg font-black tracking-tight">Current orders</h2>
            <div className="mt-3 grid gap-2">
              {orders.length === 0 ? (
                <div className="rounded-xl border border-sky-200/70 bg-sky-50 p-3 text-sm text-zinc-700">
                  No orders available.
                </div>
              ) : (
                orders.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedOrderId(o.id)}
                    className={[
                      'rounded-xl border p-3 text-left transition',
                      selectedOrder?.id === o.id
                        ? 'border-sky-300 bg-white'
                        : 'border-sky-200/70 bg-sky-50/70 hover:border-sky-300 hover:bg-white',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-zinc-900">{o.customerName}</div>
                        <div className="mt-0.5 text-xs font-semibold text-zinc-700">
                          {formatInr(o.subtotalInr)}
                        </div>
                      </div>
                      <span
                        className={[
                          'rounded-full px-2 py-1 text-[10px] font-black tracking-wider',
                          o.status === 'on_the_way'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800',
                        ].join(' ')}
                      >
                        {o.status === 'on_the_way' ? 'ON THE WAY' : 'PENDING'}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-sky-200/70 bg-white/70 p-4">
            {!selectedOrder ? (
              <div className="text-sm text-zinc-700">Select an order to view details.</div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black tracking-tight">{selectedOrder.customerName}</h2>
                    <div className="mt-1 text-sm text-zinc-700">{selectedOrder.customerEmail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-zinc-700">Total value</div>
                    <div className="text-lg font-black text-zinc-900">
                      {formatInr(selectedOrder.subtotalInr)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-sky-200/70 bg-sky-50 p-3">
                  <div className="text-xs font-black tracking-wider text-zinc-900">ADDRESS</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">
                    {selectedOrder.address}
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-sky-200/70">
                  <iframe
                    title="Order map"
                    src={mapSrc}
                    className="h-[320px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'on_the_way')
                      const destination = encodeURIComponent(selectedOrder.address)
                      const origin = currentLocation
                        ? `${currentLocation.lat},${currentLocation.lng}`
                        : ''
                      const navUrl = origin
                        ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${destination}&travelmode=driving`
                        : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`
                      window.open(navUrl, '_blank')
                    }}
                    className="rounded-xl bg-white px-4 py-3 text-xs font-black tracking-wider text-zinc-950 transition hover:bg-zinc-100"
                  >
                    CONFIRM ORDER + START NAVIGATION
                  </button>

                  {selectedOrder.status === 'on_the_way' ? (
                    <span className="rounded-xl border border-emerald-200 bg-emerald-100 px-3 py-2 text-xs font-black tracking-wider text-emerald-800">
                      STATUS: ON THE WAY
                    </span>
                  ) : (
                    <span className="rounded-xl border border-amber-200 bg-amber-100 px-3 py-2 text-xs font-black tracking-wider text-amber-800">
                      STATUS: PENDING
                    </span>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

