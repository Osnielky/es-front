'use client'

import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import { whatsappUrl } from '@/lib/contact'

interface Props {
  vehicleId?: string
  vin?: string | null
  year: number
  make: string
  model: string
  trim?: string | null
  price?: number
  stockNumber?: string
  label?: string
  className?: string
}

/** WhatsApp deep link for one vehicle. Also records a WHATSAPP lead so the dashboard can count it. */
export default function WhatsAppButton({
  vehicleId,
  vin,
  year,
  make,
  model,
  trim,
  price,
  stockNumber,
  label = 'Ask on WhatsApp',
  className = 'btn-wa btn-sm',
}: Props) {
  const vehicleName = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`
  const ref = stockNumber ? ` (Stock #${stockNumber})` : vin ? ` (VIN ${vin})` : ''
  const priceText = price ? ` listed at $${price.toLocaleString('en-US')}` : ''
  const message = `Hi! I'm interested in the ${vehicleName}${ref}${priceText}. Is it still available?`

  const handleClick = () => {
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'WhatsApp Visitor',
        email: 'whatsapp@tracked.internal',
        type: 'WHATSAPP',
        message: `WhatsApp inquiry: ${vehicleName}${ref}`,
        vehicleId: vehicleId ?? vin ?? undefined,
      }),
    }).catch(() => {})
  }

  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      <WhatsAppIcon className="h-[18px] w-[18px]" />
      {label}
    </a>
  )
}
