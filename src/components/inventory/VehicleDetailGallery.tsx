'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Maximize2, Car } from 'lucide-react'

// Tiny gray SVG used as blur placeholder while images load
const BLUR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjMiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4='

interface Props {
  images: string[]
  alt: string
}

export default function VehicleDetailGallery({ images, alt }: Props) {
  const [mainIdx, setMainIdx] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [startX, setStartX] = useState(0)
  const count = images.length

  const handlePrev = useCallback(() => setMainIdx((i) => (i === 0 ? count - 1 : i - 1)), [count])
  const handleNext = useCallback(() => setMainIdx((i) => (i === count - 1 ? 0 : i + 1)), [count])

  const handleTouchStart = (e: React.TouchEvent) => setStartX(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX
    if (startX - endX > 50) handleNext()
    if (endX - startX > 50) handlePrev()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullscreen) return
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreen, handlePrev, handleNext])

  if (count === 0) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-md border border-line bg-slate-100 text-slate-400">
        <Car className="h-16 w-16" strokeWidth={1} />
        <p className="text-sm font-semibold">Photos coming soon. Ask us on WhatsApp for a walk-around video.</p>
      </div>
    )
  }

  const arrowCls = 'absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md transition-opacity hover:bg-white'

  return (
    <>
      <div className="grid gap-2">
        {/* Main image */}
        <div
          className="group relative aspect-[4/3] overflow-hidden rounded-md bg-slate-100"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[mainIdx]}
            alt={`${alt}, photo ${mainIdx + 1} of ${count}`}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            quality={85}
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            priority
          />

          {/* Preload prev + next images so navigation feels instant */}
          {count > 1 && [-1, 1].map((offset) => {
            const idx = (mainIdx + offset + count) % count
            return (
              <div key={`${idx}-${offset}`} aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none' }}>
                <Image src={images[idx]} alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" quality={85} />
              </div>
            )
          })}

          {count > 1 && (
            <>
              <button onClick={handlePrev} className={`${arrowCls} left-3`} aria-label="Previous photo">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={handleNext} className={`${arrowCls} right-3`} aria-label="Next photo">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <button
            onClick={() => setFullscreen(true)}
            className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded bg-brand-800/70 text-white hover:bg-brand-800"
            aria-label="View full screen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>

          <span className="absolute bottom-3 left-3 rounded-sm bg-brand-800/80 px-2.5 py-1 text-sm font-semibold text-white tabular-nums">
            {mainIdx + 1} / {count}
          </span>
        </div>

        {/* Thumbnails */}
        {count > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainIdx(idx)}
                aria-pressed={idx === mainIdx}
                aria-label={`Photo ${idx + 1}`}
                className={`relative aspect-[4/3] w-[88px] flex-none overflow-hidden rounded border-2 transition-colors ${
                  idx === mainIdx ? 'border-accent-500' : 'border-transparent hover:border-brand-300'
                }`}
              >
                <Image src={img} alt="" fill sizes="88px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={() => setFullscreen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 z-50 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative mx-auto h-full w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[mainIdx]} alt={alt} fill sizes="100vw" quality={90} className="object-contain" priority />

            {count > 1 && (
              <>
                <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/40" aria-label="Previous photo">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/40" aria-label="Next photo">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-black/50 px-4 py-2 text-white tabular-nums">
              {mainIdx + 1} / {count}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
