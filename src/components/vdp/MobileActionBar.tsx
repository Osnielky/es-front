'use client'

import { MessageSquareText } from 'lucide-react'
import WhatsAppButton from '@/components/inventory/WhatsAppButton'
import { useVdp } from './VdpContext'
import { formatPrice } from './ContactPanel'

// Fixed bottom bar on phones (<768px). Slides away while the inquiry sheet or photo viewer is open.
export default function MobileActionBar() {
  const { vehicle, openInquiry, overlayOpen } = useVdp()
  if (vehicle.status === 'SOLD') return null
  const price = formatPrice(vehicle.price)

  return (
    <div
      className={`sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 pt-2.5 shadow-[0_-8px_24px_rgba(12,26,61,0.12)] transition-transform duration-200 md:hidden ${
        overlayOpen ? 'translate-y-full' : ''
      }`}
      style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
      aria-hidden={overlayOpen || undefined}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="price truncate text-2xl">{price ?? <span className="font-display text-lg text-ink">Call for price</span>}</p>
          {vehicle.estMonthly && (
            <p className="truncate text-xs text-slate-500">
              Est. ${vehicle.estMonthly.toLocaleString('en-US')}/mo<a href="#finance-disclaimer" aria-label="How the estimate is calculated">*</a>
            </p>
          )}
        </div>
        <WhatsAppButton
          vehicleId={vehicle.id}
          year={vehicle.year}
          make={vehicle.make}
          model={vehicle.model}
          trim={vehicle.trim}
          stockNumber={vehicle.stock}
          url={vehicle.url}
          label=""
          className="btn-wa hidden h-12 w-12 flex-shrink-0 px-0 min-[360px]:inline-flex [&>svg]:h-5 [&>svg]:w-5"
        />
        <button type="button" onClick={() => openInquiry('availability')} aria-haspopup="dialog" className="vdp-btn-primary flex-shrink-0 px-4">
          <MessageSquareText className="h-5 w-5" aria-hidden="true" />
          Contact dealer
        </button>
      </div>
    </div>
  )
}
