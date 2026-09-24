'use client'

// Inline photo gallery: Embla main carousel + synchronized thumbnail strip. The full-screen viewer
// (zoom + thumbnails) is a separate chunk loaded on first open, and shares the selected index.
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import useEmblaCarousel from 'embla-carousel-react'
import { Camera, ChevronLeft, ChevronRight, ImageOff, Maximize2 } from 'lucide-react'
import { useVdp } from './VdpContext'

const VdpLightbox = dynamic(() => import('./VdpLightbox'), { ssr: false })

interface Props {
  images: string[]
  name: string
}

type Size = { width: number; height: number }

// Landscape photos within ~12% of the frame's shape fill it: a 4:3 dealer photo in the 3:2 frame loses
// ~6% of sky/pavement top and bottom, never the car's body. Portrait or panoramic shots are shown whole.
const COVER_TOLERANCE = 0.12

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function VdpGallery({ images, name }: Props) {
  const { setLightboxOpen } = useVdp()
  const count = images.length
  const multiple = count > 1

  const [index, setIndex] = useState(0)
  // Slides whose <Image> has been mounted; starts with the hero only so first load fetches one photo
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]))
  const [warm, setWarm] = useState(false)
  const [failed, setFailed] = useState<Set<number>>(() => new Set())
  const [sizes, setSizes] = useState<Record<number, Size>>({})
  const [frameRatio, setFrameRatio] = useState(4 / 3)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerLoaded, setViewerLoaded] = useState(false)

  const frameRef = useRef<HTMLDivElement>(null)
  const expandRef = useRef<HTMLButtonElement>(null)

  const [mainRef, mainApi] = useEmblaCarousel({ loop: multiple, duration: 22, watchDrag: multiple })
  const [thumbsRef, thumbsApi] = useEmblaCarousel({ dragFree: true, containScroll: 'keepSnaps' })

  // Neighbors prefetch once the page is idle or the visitor engages with the gallery
  useEffect(() => {
    const warmUp = () => setWarm(true)
    const schedule = () =>
      typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(warmUp, { timeout: 4000 }) : window.setTimeout(warmUp, 2500)
    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })
    return () => window.removeEventListener('load', schedule)
  }, [])

  useEffect(() => {
    setMounted((prev) => {
      const next = new Set(prev)
      next.add(index)
      if (warm && multiple) {
        next.add((index + 1) % count)
        next.add((index - 1 + count) % count)
      }
      return next.size === prev.size ? prev : next
    })
  }, [index, warm, multiple, count])

  useEffect(() => {
    if (!mainApi) return
    const onSelect = () => {
      const i = mainApi.selectedScrollSnap()
      setIndex(i)
      thumbsApi?.scrollTo(i, prefersReducedMotion())
    }
    const onPointer = () => setWarm(true)
    mainApi.on('select', onSelect).on('pointerDown', onPointer)
    return () => {
      mainApi.off('select', onSelect).off('pointerDown', onPointer)
    }
  }, [mainApi, thumbsApi])

  // The frame is 4:3 on phones and 3:2 from md (height-capped on tablets); the fit decision needs its actual shape
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width && height) setFrameRatio(width / height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const goTo = useCallback((i: number) => mainApi?.scrollTo(i, prefersReducedMotion()), [mainApi])
  const prev = useCallback(() => mainApi?.scrollPrev(prefersReducedMotion()), [mainApi])
  const next = useCallback(() => mainApi?.scrollNext(prefersReducedMotion()), [mainApi])

  const openViewer = () => {
    setViewerLoaded(true)
    setViewerOpen(true)
    setLightboxOpen(true)
  }

  const closeViewer = (finalIndex: number) => {
    setViewerOpen(false)
    setLightboxOpen(false)
    mainApi?.scrollTo(finalIndex, true)
    expandRef.current?.focus({ preventScroll: true })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && multiple) {
      e.preventDefault()
      setWarm(true)
      prev()
    } else if (e.key === 'ArrowRight' && multiple) {
      e.preventDefault()
      setWarm(true)
      next()
    } else if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault()
      openViewer()
    }
  }

  const alt = (i: number) => (i === 0 ? `${name} for sale in Naples, FL` : `${name}, photo ${i + 1} of ${count}`)

  const fitFor = (i: number) => {
    const size = sizes[i]
    if (!size) return 'object-contain'
    const ratio = size.width / size.height
    return ratio > 1 && Math.abs(ratio / frameRatio - 1) <= COVER_TOLERANCE ? 'object-cover' : 'object-contain'
  }

  if (count === 0) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-panel border border-line bg-ivory text-center md:aspect-[3/2]">
        <Camera className="h-10 w-10 text-champagne" strokeWidth={1.25} aria-hidden="true" />
        <p className="text-base font-semibold text-navy">Photos coming soon</p>
        <p className="max-w-xs text-sm text-ink-muted">Ask us and we’ll send current photos or a walkaround video of this vehicle.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`Photos of the ${name}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerEnter={() => setWarm(true)}
        className="group relative overflow-hidden rounded-panel border border-line bg-[#EFE6D6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
      >
        <div ref={mainRef} className="overflow-hidden">
          <div ref={frameRef} className="flex aspect-[4/3] w-full touch-pan-y md:aspect-[3/2] md:max-h-[62vh] desk:max-h-none">
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative h-full min-w-0 flex-[0_0_100%]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={i !== index}
              >
                {failed.has(i) ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-muted">
                    <ImageOff className="h-9 w-9" strokeWidth={1.25} aria-hidden="true" />
                    <span className="text-sm">This photo couldn’t be loaded</span>
                  </div>
                ) : mounted.has(i) ? (
                  <button
                    type="button"
                    onClick={openViewer}
                    tabIndex={-1}
                    className="relative block h-full w-full cursor-zoom-in"
                    aria-label={`${alt(i)}. Open full screen`}
                  >
                    <Image
                      src={src}
                      alt={alt(i)}
                      fill
                      sizes="(min-width: 1200px) 900px, (min-width: 768px) 92vw, 100vw"
                      quality={85}
                      priority={i === 0}
                      fetchPriority={i === 0 ? 'high' : 'low'}
                      loading={i === 0 ? undefined : 'eager'}
                      draggable={false}
                      className={`${fitFor(i)} select-none`}
                      onLoad={(e) => {
                        const img = e.currentTarget
                        if (img.naturalWidth) setSizes((s) => ({ ...s, [i]: { width: img.naturalWidth, height: img.naturalHeight } }))
                      }}
                      onError={() => setFailed((f) => new Set(f).add(i))}
                    />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {multiple && (
          <>
            <button
              type="button"
              onClick={() => {
                setWarm(true)
                prev()
              }}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-navy shadow-md transition-colors duration-150 hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setWarm(true)
                next()
              }}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-navy shadow-md transition-colors duration-150 hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-sm font-medium text-white">
              <Camera className="h-4 w-4" aria-hidden="true" />
              <span aria-live="polite" aria-atomic="true">
                <span className="sr-only">Photo </span>
                {index + 1}
                <span aria-hidden="true"> / </span>
                <span className="sr-only"> of </span>
                {count}
              </span>
            </p>
          </>
        )}

        <button
          ref={expandRef}
          type="button"
          onClick={openViewer}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-ivory/90 text-navy shadow-md transition-colors duration-150 hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          aria-label={`View photo ${index + 1} full screen with zoom`}
        >
          <Maximize2 className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {multiple && (
        <div ref={thumbsRef} className="overflow-hidden">
          <ul className="flex gap-2 p-0.5" aria-label="Choose a photo">
            {images.map((src, i) => (
              <li key={`${src}-${i}`} className="flex-[0_0_auto]">
                <button
                  type="button"
                  onClick={() => {
                    setWarm(true)
                    goTo(i)
                  }}
                  aria-label={`Show photo ${i + 1} of ${count}`}
                  aria-current={i === index ? 'true' : undefined}
                  className={`relative block h-16 w-[5.5rem] overflow-hidden rounded-lg border-2 bg-[#EFE6D6] transition-[border-color,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-1 md:h-[4.5rem] md:w-24 ${
                    i === index ? 'border-navy' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  {failed.has(i) ? (
                    <ImageOff className="mx-auto h-5 w-5 text-ink-muted" aria-hidden="true" />
                  ) : (
                    <Image
                      src={src}
                      alt=""
                      width={96}
                      height={72}
                      sizes="96px"
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover"
                      onError={() => setFailed((f) => new Set(f).add(i))}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {viewerLoaded && (
        <VdpLightbox
          open={viewerOpen}
          index={index}
          images={images}
          sizes={sizes}
          alt={alt}
          onIndexChange={(i) => mainApi?.scrollTo(i, true)}
          onClose={closeViewer}
        />
      )}
    </div>
  )
}
