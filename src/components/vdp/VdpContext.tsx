'use client'

// Shared client state for the vehicle detail page: which contact overlay is open, and whether any
// overlay (inquiry dialog or photo viewer) is covering the page so the mobile action bar can step aside.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'

export type InquiryIntent = 'availability' | 'test-drive'

// Plain, serializable vehicle context passed from the server page to the client islands
export interface VdpVehicle {
  id: string
  year: number
  make: string
  model: string
  trim: string | null
  name: string
  stock: string
  vin: string | null
  path: string
  url: string
  price: number
  estMonthly: number | null
  image?: string
  status: 'AVAILABLE' | 'SOLD' | 'PENDING'
}

interface VdpContextValue {
  vehicle: VdpVehicle
  openInquiry: (intent: InquiryIntent) => void
  overlayOpen: boolean
  setLightboxOpen: (open: boolean) => void
}

const Ctx = createContext<VdpContextValue | null>(null)

// The form (react-hook-form + zod resolver) only downloads when a visitor first opens it
const InquiryDialog = dynamic(() => import('./InquiryDialog'), { ssr: false })

export function VdpProvider({ vehicle, children }: { vehicle: VdpVehicle; children: ReactNode }) {
  const [intent, setIntent] = useState<InquiryIntent | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  // Mounted on first open and kept, so a visitor who closes the dialog mid-way keeps what they typed
  const [dialogMounted, setDialogMounted] = useState(false)

  const openInquiry = useCallback((next: InquiryIntent) => {
    setDialogMounted(true)
    setIntent(next)
  }, [])

  // Warm the form chunk once the page is idle so the first "Check availability" tap opens instantly
  useEffect(() => {
    const load = () => void import('./InquiryDialog')
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(load, { timeout: 5000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(load, 3000)
    return () => window.clearTimeout(id)
  }, [])

  const value = useMemo(
    () => ({ vehicle, openInquiry, overlayOpen: intent !== null || lightboxOpen, setLightboxOpen }),
    [vehicle, openInquiry, intent, lightboxOpen]
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      {dialogMounted && <InquiryDialog vehicle={vehicle} intent={intent} onClose={() => setIntent(null)} />}
    </Ctx.Provider>
  )
}

export function useVdp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useVdp must be used inside <VdpProvider>')
  return ctx
}

// Small client button so server-rendered sections can open the inquiry dialog
export function InquiryButton({ intent, className, children }: { intent: InquiryIntent; className?: string; children: ReactNode }) {
  const { openInquiry } = useVdp()
  return (
    <button type="button" onClick={() => openInquiry(intent)} aria-haspopup="dialog" className={className}>
      {children}
    </button>
  )
}
