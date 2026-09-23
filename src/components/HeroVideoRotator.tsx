'use client'

import { useEffect, useState, useRef } from 'react'

const VIDEOS = [
  '/videos/7154209-hd_1920_1080_25fps.mp4',
  '/videos/7154222-hd_1920_1080_25fps.mp4',
  '/videos/14228182-hd_1920_1080_60fps.mp4',
]

// Videos are 2.5–7.7 MB each. They never block first paint (the hero gradient + text are the LCP),
// and are skipped entirely on phones, Data Saver, and prefers-reduced-motion.
function shouldPlayVideo() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return (
    window.matchMedia('(min-width: 768px)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !connection?.saveData
  )
}

export default function HeroVideoRotator() {
  const [enabled, setEnabled] = useState(false)
  const [currentVideo, setCurrentVideo] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  // Mount videos only after the page has loaded so they don't compete with critical resources
  useEffect(() => {
    if (!shouldPlayVideo()) return
    const start = () => setEnabled(true)
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => window.removeEventListener('load', start)
  }, [])

  useEffect(() => {
    if (!enabled) return
    videoRefs.current.forEach((video, idx) => {
      if (!video) return
      if (idx === currentVideo) video.play().catch(() => {})
      else video.pause()
    })
  }, [currentVideo, enabled])

  useEffect(() => {
    if (!enabled) return
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % VIDEOS.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      {VIDEOS.map((src, idx) => (
        <video
          key={src}
          ref={(el) => {
            videoRefs.current[idx] = el
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            idx === currentVideo ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          loop
          playsInline
          aria-hidden="true"
          // Only the visible video downloads up front; others fetch when first played
          preload={idx === currentVideo ? 'auto' : 'none'}
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {VIDEOS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentVideo(idx)}
            className={`h-2 w-2 rounded-full transition-all ${
              idx === currentVideo
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Play video ${idx + 1}`}
          />
        ))}
      </div>
    </>
  )
}
