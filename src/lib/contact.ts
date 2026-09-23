// Client-safe dealer contact helpers (NEXT_PUBLIC_* values are inlined at build time)
export const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? '+1 (941) 499-7415'

// Normalizes a US number to E.164 digits with country code: "+1 (941) 499-7415" → "19414997415"
function toE164Digits(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 ? `1${digits}` : digits
}

export const TEL_HREF = `tel:+${toE164Digits(DEALER_PHONE)}`

const WHATSAPP_DIGITS = toE164Digits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEALER_PHONE)

export function whatsappHref(message: string) {
  return `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(message)}`
}
