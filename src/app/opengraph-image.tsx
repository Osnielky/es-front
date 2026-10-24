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
          background: '#15295A',
          color: '#fff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 600, color: '#B9C4E0' }}>
          {LOCATION.city}, {LOCATION.stateCode} · {LOCATION.serviceArea}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 100, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.01em' }}>{dealerName}</div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 40, color: '#B9C4E0' }}>
            Inspected used cars · Financing for every credit · Trade-ins
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 36, fontWeight: 700 }}>{phone}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 14, background: '#C1121F', display: 'flex' }} />
      </div>
    ),
    size
  )
}
