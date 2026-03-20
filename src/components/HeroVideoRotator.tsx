'use client'

import { useEffect, useState, useRef } from 'react'

const VIDEOS = [
  '/videos/7154209-hd_1920_1080_25fps.mp4',
  '/videos/7154222-hd_1920_1080_25fps.mp4',
  '/videos/14228182-hd_1920_1080_60fps.mp4',
]

export default function HeroVideoRotator() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    // Play current video, pause others
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === currentVideo) {
          video.play().catch(() => {}) // Play, ignore errors
        } else {
          video.pause()
        }
      }
    })
  }, [currentVideo])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % VIDEOS.length)
    }, 10000) // Change video every 10 seconds

    return () => clearInterval(interval)
  }, [])

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
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}

      {/* Video indicators */}
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
