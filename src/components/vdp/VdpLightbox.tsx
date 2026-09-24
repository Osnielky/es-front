'use client'

// Full-screen photo viewer (loaded on first open). Uses the Next image optimizer for a responsive
// srcSet so zooming in pulls a larger variant instead of upscaling the inline one.
import { useRef } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

interface Props {
  open: boolean
  index: number
  images: string[]
  sizes: Record<number, { width: number; height: number }>
  alt: (index: number) => string
  onIndexChange: (index: number) => void
  onClose: (index: number) => void
}

// Must be members of images.deviceSizes in next.config.ts, or the optimizer rejects them
const WIDTHS = [828, 1200, 1920]

function optimized(src: string, width: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=85`
}

export default function VdpLightbox({ open, index, images, sizes, alt, onIndexChange, onClose }: Props) {
  // Index the viewer is showing, reported back on close so the inline gallery lands on the same photo
  const current = useRef(index)
  current.current = index
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const slides = images.map((src, i) => {
    // Unknown until the inline photo loads; 4:3 is the typical dealer photo shape
    const { width, height } = sizes[i] ?? { width: 1600, height: 1200 }
    return {
      src: optimized(src, 1920),
      alt: alt(i),
      width,
      height,
      srcSet: WIDTHS.map((w) => ({ src: optimized(src, w), width: w, height: Math.round((w * height) / width) })),
    }
  })

  const single = images.length === 1

  return (
    <Lightbox
      open={open}
      index={index}
      slides={slides}
      plugins={single ? [Zoom] : [Zoom, Thumbnails]}
      close={() => onClose(current.current)}
      on={{
        view: ({ index: i }) => {
          current.current = i
          onIndexChange(i)
        },
      }}
      carousel={{ finite: single, preload: 1 }}
      animation={reduceMotion ? { fade: 0, swipe: 0, zoom: 0 } : { fade: 200, swipe: 220 }}
      controller={{ closeOnBackdropClick: true }}
      render={single ? { buttonPrev: () => null, buttonNext: () => null } : undefined}
      zoom={{ maxZoomPixelRatio: 2.5, scrollToZoom: true }}
      thumbnails={{ width: 96, height: 64, border: 2, borderRadius: 8, padding: 0, gap: 10, imageFit: 'cover', vignette: false }}
      labels={{ Close: 'Close photo viewer', Previous: 'Previous photo', Next: 'Next photo', 'Zoom in': 'Zoom in', 'Zoom out': 'Zoom out' }}
      styles={{
        container: { backgroundColor: 'rgba(12, 22, 36, 0.96)' },
        thumbnailsContainer: { backgroundColor: 'rgba(12, 22, 36, 0.96)' },
        thumbnail: { ['--yarl__thumbnails_thumbnail_active_border_color' as string]: '#FFFDF8', backgroundColor: '#1d2b3d' },
      }}
    />
  )
}
