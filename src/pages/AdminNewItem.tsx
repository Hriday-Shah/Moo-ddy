import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DuplicateProductNameError, addProduct } from '../data/products'

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the selected image file. Try a different image.'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}

function describeSaveError(err: unknown) {
  if (err instanceof DuplicateProductNameError) {
    return 'Item name already exists. Use a different name.'
  }
  if (err instanceof Error) {
    const msg = err.message.trim()
    if (msg) return msg
  }
  return 'Could not save item. Please try again.'
}

export function AdminNewItem() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [price, setPrice] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageCredit, setImageCredit] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')

  const parsedPrice = useMemo(() => {
    const p = Number(price)
    if (!Number.isFinite(p)) return null
    return Math.max(0, Math.round(p))
  }, [price])

  const canSubmit =
    name.trim().length > 0 && parsedPrice !== null && imagePreview.length > 0 && !!imageFile
  const submitDisabledReason =
    name.trim().length === 0
      ? 'Enter an item name.'
      : parsedPrice === null
        ? 'Enter a valid price.'
        : imagePreview.length === 0
          ? 'Select an image.'
          : ''

  return (
    <div className="min-h-dvh bg-[#66CCFF] text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-sky-200/70 bg-[#66CCFF]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <div className="min-w-0">
            <div className="text-xs font-black tracking-wider text-zinc-700">ADMIN</div>
            <h1 className="truncate text-xl font-black tracking-tight">Add item</h1>
          </div>

          <Link
            to="/admin"
            className="rounded-xl border border-sky-200/70 bg-sky-50/70 px-3 py-2 text-xs font-black tracking-wider text-zinc-900 transition hover:border-sky-300 hover:bg-sky-100"
          >
            BACK
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-sky-200/70 bg-white/70 p-5">
            <h2 className="text-lg font-black tracking-tight">Item details</h2>
            <p className="mt-1 text-sm text-zinc-700">
              Upload an image, set the name, and set the price (INR).
            </p>

            <form
              className="mt-5 grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault()
                setError('')
                if (!canSubmit || saving || parsedPrice === null) {
                  if (submitDisabledReason) setError(submitDisabledReason)
                  return
                }
                setSaving(true)
                try {
                  if (!imageFile) throw new Error('Select an image.')
                  await addProduct({
                    name: name.trim(),
                    priceInr: parsedPrice,
                    imageFile,
                    ...(imageCredit.trim() ? { imageCredit: imageCredit.trim() } : {}),
                  })
                  navigate('/admin')
                } catch (err) {
                  setError(describeSaveError(err))
                } finally {
                  setSaving(false)
                }
              }}
            >
              {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-100">
                  {error}
                </div>
              ) : null}
              <div className="grid gap-2">
                <label className="text-xs font-black tracking-wider text-zinc-700">IMAGE</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  className="block w-full rounded-xl border border-sky-200/60 bg-white/60 p-3 text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-black file:tracking-wider file:text-zinc-950 hover:border-sky-300"
                  onChange={async (e) => {
                    setError('')
                    const file = e.target.files?.[0] ?? null
                    setImageFile(file)
                    if (!file) {
                      setImagePreview('')
                      return
                    }
                    try {
                      const dataUrl = await fileToDataUrl(file)
                      setImagePreview(dataUrl)
                    } catch (err) {
                      setImagePreview('')
                      setError(describeSaveError(err))
                    }
                  }}
                />
                <div className="text-xs font-semibold text-zinc-700">
                  Stored locally for now (no backend yet).
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-black tracking-wider text-zinc-700">
                  IMAGE CREDIT <span className="font-semibold text-zinc-500">(optional)</span>
                </label>
                <input
                  value={imageCredit}
                  onChange={(e) => setImageCredit(e.target.value)}
                  placeholder='e.g. Photo: Your Name or Unsplash — name'
                  className="h-11 w-full rounded-xl border border-sky-200/60 bg-white/60 px-3 text-sm font-semibold text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-sky-300 focus:bg-white/80"
                />
                <div className="text-xs font-semibold text-zinc-700">
                  This line appears under the product image for customers.
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-black tracking-wider text-zinc-700">NAME</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g., Butter"
                  className="h-11 w-full rounded-xl border border-sky-200/60 bg-white/60 px-3 text-sm font-semibold text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-sky-300 focus:bg-white/80"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-black tracking-wider text-zinc-700">PRICE (INR)</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  inputMode="numeric"
                  placeholder="e.g., 60"
                  className="h-11 w-full rounded-xl border border-sky-200/60 bg-white/60 px-3 text-sm font-semibold text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-sky-300 focus:bg-white/80"
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmit || saving}
                className={[
                  'mt-2 h-11 rounded-xl text-sm font-black tracking-wide transition active:scale-[0.99]',
                  !canSubmit || saving
                    ? 'cursor-not-allowed bg-white/20 text-zinc-300'
                    : 'bg-white text-zinc-950 hover:bg-zinc-100',
                ].join(' ')}
              >
                {saving ? 'Saving…' : 'Save item'}
              </button>
            </form>
          </section>

          <aside className="rounded-2xl border border-sky-200/70 bg-white/70 p-5">
            <h2 className="text-lg font-black tracking-tight">Preview</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-sky-200/60 bg-sky-50/60">
              <div className="relative aspect-[4/3] w-full bg-black/20">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-sm text-zinc-600">
                    No image selected
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              </div>
              <div className="p-4">
                <div className="truncate text-base font-black tracking-tight">
                  {name.trim() ? name.trim() : 'Item name'}
                </div>
                <div className="mt-0.5 text-xs font-bold tracking-wide text-zinc-700">
                  {parsedPrice === null ? formatInr(0) : formatInr(parsedPrice)}
                </div>
                {imageCredit.trim() ? (
                  <div className="mt-2 text-[10px] font-semibold leading-snug text-zinc-600">
                    {imageCredit.trim()}
                  </div>
                ) : null}
                {imageFile ? (
                  <div className="mt-2 text-xs font-semibold text-zinc-700">
                    File: <span className="font-black text-zinc-900">{imageFile.name}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

