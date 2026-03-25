import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { firestore, storage } from '../lib/firebase'

export type Product = {
  id: string
  name: string
  priceInr: number
  imageUrl: string
  /** Shown on the customer shop under the product image (e.g. photo credit). */
  imageCredit?: string
  /** Internal: used to check duplicate names efficiently. */
  normalizedName?: string
  /** Internal: Storage path so we can delete the image. */
  imageStoragePath?: string
  createdAt: number
}

const PRODUCTS_COL = 'products'

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

export class DuplicateProductNameError extends Error {
  constructor() {
    super('A product with that name already exists.')
    this.name = 'DuplicateProductNameError'
  }
}

export async function addProduct(input: {
  name: string
  priceInr: number
  imageFile: File
  imageCredit?: string
}) {
  const normalized = normalizeName(input.name)
  const existing = await getDocs(
    query(collection(firestore, PRODUCTS_COL), where('normalizedName', '==', normalized), limit(1)),
  )
  if (!existing.empty) throw new DuplicateProductNameError()

  const productRef = doc(collection(firestore, PRODUCTS_COL))
  const safeFilename = input.imageFile.name.replace(/[^\w.\-()]+/g, '_')
  const storagePath = `product-images/${productRef.id}/${Date.now()}-${safeFilename}`
  const objectRef = ref(storage, storagePath)

  await uploadBytes(objectRef, input.imageFile, {
    contentType: input.imageFile.type || undefined,
  })

  const imageUrl = await getDownloadURL(objectRef)
  const createdAt = Date.now()

  await setDoc(productRef, {
    name: input.name.trim(),
    normalizedName: normalized,
    priceInr: input.priceInr,
    imageUrl,
    imageStoragePath: storagePath,
    imageCredit: input.imageCredit?.trim() ? input.imageCredit.trim() : undefined,
    createdAt,
  })
}

export async function removeProduct(productId: string) {
  const productRef = doc(firestore, PRODUCTS_COL, productId)
  const snap = await getDoc(productRef)
  const data = snap.exists() ? (snap.data() as { imageStoragePath?: unknown }) : null
  const imageStoragePath = typeof data?.imageStoragePath === 'string' ? data.imageStoragePath : ''

  await deleteDoc(productRef)
  if (imageStoragePath) {
    await deleteObject(ref(storage, imageStoragePath)).catch(() => {
      // Best-effort: product doc is already removed.
    })
  }
}

export async function updateProductImageCredit(productId: string, imageCredit: string) {
  const trimmed = imageCredit.trim()
  const productRef = doc(firestore, PRODUCTS_COL, productId)
  await updateDoc(productRef, {
    imageCredit: trimmed ? trimmed : deleteField(),
  })
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const q = query(collection(firestore, PRODUCTS_COL), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Product[] = snap.docs.map((d) => {
          const data = d.data() as Omit<Product, 'id'>
          return { id: d.id, ...data }
        })
        setProducts(next)
      },
      () => {
        setProducts([])
      },
    )
    return () => unsub()
  }, [])

  const sorted = useMemo(
    () => [...products].sort((a, b) => b.createdAt - a.createdAt),
    [products],
  )

  return sorted
}

