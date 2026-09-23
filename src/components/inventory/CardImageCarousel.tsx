'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Car, ImageIcon } from 'lucide-react'

interface Props {
  images: string[]
  alt: string
  href: string
  priority?: boolean
  sizes: string
}

const MAX_DOTS = 5

// Card photo with dot navigation. Only the first photo loads up front; others load when the shopper
// swipes, taps a dot, or hovers the card (so a grid of 12 cards still downloads 12 images, not 70).
export default function CardImageCarousel({ images, alt, href, priority = false, sizes }: Props) {
  const [index, setIndex] = useState(0)
  const [warm, setWarm] = useState(false)
  const [startX, setStartX] = useState<number | null>(null)
  const count = images.length

  if (count === 0) {
    return (
      <Link href={href} tabIndex={-1} aria-hidden="true" className="flex h-full w-full items-center justify-center bg-sand">
        <Car className="h-16 w-16 text-sand-300" />
      </Link>
    )
  }

  const go = (next: number) => {
    setWarm(true)
    setIndex((next + count) % count)
  }

  return (
    <div
      className="relative h-full w-full"
      onPointerEnter={() => setWarm(true)}
      onTouchStart={(e) => {
        setWarm(true)
        setStartX(e.touches[0].clientX)
      }}
      onTouchEnd={(e) => {
        if (startX === null) return
        const dx = e.changedTouches[0].clientX - startX
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
        setStartX(null)
      }}
    >
      <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
        {images.map((src, i) => {
          // Render the visible photo, plus its neighbors once the shopper shows intent
          const visible = i === index
          const neighbor = warm && (i === (index + 1) % count || i === (index - 1 + count) % count)
          if (!visible && !neighbor) return null
          return (
            <Image
              key={src}
              src={src}
              alt={visible ? alt : ''}
              fill
              sizes={sizes}
              className={`object-cover transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
              priority={priority && i === 0}
              fetchPriority={priority && i === 0 ? 'high' : 'auto'}
              loading={priority && i === 0 ? undefined : 'lazy'}
            />
          )
        })}
      </Link>

      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
          {images.slice(0, MAX_DOTS).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === Math.min(index, MAX_DOTS - 1) ? 'true' : undefined}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`block h-2 w-2 rounded-full border border-white shadow-sm transition-colors ${
                  i === Math.min(index, MAX_DOTS - 1) ? 'bg-white' : 'bg-transparent'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-900/80 px-2.5 py-1 text-xs font-medium text-white">
        <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {count} {count === 1 ? 'photo' : 'photos'}
      </span>
    </div>
  )
}
