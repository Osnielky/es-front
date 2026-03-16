'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

interface Props {
  images: string[]
  alt: string
}

export default function VehicleGallery({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700">
        <div className="flex flex-col items-center gap-2 text-brand-400">
          <ImageOff className="h-14 w-14" strokeWidth={1.2} />
          <span className="text-sm">No images available</span>
        </div>
      </div>
    )
  }

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-card-hover">
        <Image
          src={images[activeIndex]}
          alt={`${alt} - photo ${activeIndex + 1}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {/* Counter badge */}
        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {activeIndex + 1} / {images.length}
        </span>
        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                i === activeIndex
                  ? 'border-brand-500 ring-2 ring-brand-300 ring-offset-1'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
