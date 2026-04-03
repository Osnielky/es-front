'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'

interface Props {
  images: string[]
  alt: string
  vehicleInfo?: {
    year: number
    make: string
    model: string
    price: number
    vin: string
  }
  whatsappNumber?: string
  isSold?: boolean
}

export default function VehicleDetailGallery({ images, alt, vehicleInfo, whatsappNumber = '1234567890', isSold = false }: Props) {
  const [mainIdx, setMainIdx] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [startX, setStartX] = useState(0)

  const handlePrev = () => setMainIdx((i) => (i === 0 ? images.length - 1 : i - 1))
  const handleNext = () => setMainIdx((i) => (i === images.length - 1 ? 0 : i + 1))

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
  }

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
  }, [fullscreen])

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    )
  }

  return (
    <>
      {/* Main gallery */}
      <div className="card overflow-hidden">
        {/* Main image */}
        <div
          className="relative aspect-[4/3] overflow-hidden bg-gray-100 group cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[mainIdx]}
            alt={alt}
            fill
            className="object-cover"
            priority
          />
          
          {/* Navigation arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Fullscreen button */}
          <button
            onClick={() => setFullscreen(true)}
            className="absolute top-3 right-3 z-10 rounded-lg bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>

          {/* WhatsApp button - hidden when sold */}
          {vehicleInfo && !isSold && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hi! I'm interested in the ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} (VIN: ${vehicleInfo.vin}). Price: $${vehicleInfo.price.toLocaleString()}. Can you tell me more?`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-14 z-10 rounded-lg bg-green-500 hover:bg-green-600 p-2.5 text-white transition-colors shadow-lg"
              aria-label="Contact via WhatsApp"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.934c-1.27.5-2.445 1.231-3.385 2.121-2.143 2.16-3.334 5.024-3.334 8.116 0 2.57.823 5.007 2.37 7.078L3.84 21l3.986-1.318c1.946 1.06 4.122 1.621 6.38 1.621 7.645 0 13.876-6.235 13.876-13.876 0-3.71-1.44-7.197-4.052-9.82-2.609-2.616-6.102-4.05-9.81-4.05z"/>
              </svg>
            </a>
          )}

          {/* Image counter */}
          <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1 text-sm text-white">
            {mainIdx + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIdx(idx)}
                  className={`relative h-16 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === mainIdx
                      ? 'border-brand-600 ring-2 ring-brand-300'
                      : 'border-gray-200 hover:border-brand-400'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${alt} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setFullscreen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 z-50 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
            aria-label="Close fullscreen"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Main fullscreen image */}
          <div className="relative w-full h-full max-w-4xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[mainIdx]}
              alt={alt}
              fill
              className="object-contain"
              priority
            />

            {/* Navigation arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/40 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/40 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 text-white">
              {mainIdx + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
