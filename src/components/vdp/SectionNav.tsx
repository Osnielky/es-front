'use client'

import { useEffect, useRef, useState } from 'react'

export interface SectionLink {
  id: string
  label: string
}

// Sticky in-page navigation under the header; highlights the section currently in view
export default function SectionNav({ sections }: { sections: SectionLink[] }) {
  const [active, setActive] = useState(sections[0]?.id)
  const navRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const offset = (navRef.current?.getBoundingClientRect().bottom ?? 0) + 24
      let current = sections[0]?.id
      for (const { id } of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= offset) current = id
      }
      // At the very bottom the last (short) section can never reach the offset line
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const last = sections[sections.length - 1]?.id
        const lastEl = last && document.getElementById(last)
        if (lastEl && lastEl.getBoundingClientRect().top < window.innerHeight) current = last
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [sections])

  // Keep the active tab visible in the horizontally scrolling strip on phones
  useEffect(() => {
    const link = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    const list = listRef.current
    if (!link || !list) return
    const left = link.offsetLeft - list.clientWidth / 2 + link.clientWidth / 2
    list.scrollTo({ left, behavior: 'smooth' })
  }, [active])

  return (
    <nav
      ref={navRef}
      aria-label="Vehicle sections"
      className="sticky top-[var(--header-h)] z-20 -mx-4 border-b border-line bg-sand/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 desk:mx-0 desk:px-0"
    >
      <ul ref={listRef} className="no-scrollbar flex gap-1 overflow-x-auto">
        {sections.map(({ id, label }) => (
          <li key={id} className="flex-shrink-0">
            <a
              href={`#${id}`}
              data-id={id}
              onClick={() => setActive(id)}
              aria-current={active === id ? 'location' : undefined}
              className={`relative inline-flex min-h-12 items-center px-3 text-[0.9375rem] font-semibold transition-colors duration-150 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors after:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy ${
                active === id ? 'text-navy after:bg-navy' : 'text-ink-muted after:bg-transparent hover:text-navy'
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
