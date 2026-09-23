import { ImageResponse } from 'next/og'
import { LOCATION } from '@/lib/seo'

// Default social share image for every page without a more specific one (e.g. VDPs use the vehicle photo)
export const alt = `${process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'} — Used Cars in Naples, FL`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  const dealerName = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
  const phone = process.env.NEXT_PUBLIC_DEALER_PHONE ?? '+1 (941) 499-7415'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1f3ee8 60%, #2563eb 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 600, color: '#c2d4ff' }}>
          {LOCATION.city}, {LOCATION.stateCode} · {LOCATION.serviceArea}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, lineHeight: 1.05 }}>{dealerName}</div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 44, color: '#e0e7ff' }}>
            Quality Used Cars · Financing · Trade-Ins
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 36, fontWeight: 700 }}>{phone}</div>
      </div>
    ),
    size
  )
}
