'use client'

// Client islands for the inventory page: save (heart), compare checkbox, compare tray, saved-cars menu, sort
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Heart, X, ChevronDown, GitCompareArrows } from 'lucide-react'
import { useCompare, useSavedCars, MAX_COMPARE, type ShortlistItem } from '@/lib/shortlist'

export function SaveCarButton({ item }: { item: ShortlistItem }) {
  const { isSaved, toggle } = useSavedCars()
  const saved = isSaved(item.id)
  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${item.title} from saved cars` : `Save ${item.title}`}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 bg-[#0c1e33]/60 shadow-md backdrop-blur-md transition-transform hover:scale-105 hover:bg-[#0c1e33]/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]"
    >
      <Heart className={`h-5 w-5 ${saved ? 'fill-red-400 text-red-400' : 'text-ivory'}`} />
    </button>
  )
}

export function CompareCheckbox({ item }: { item: ShortlistItem }) {
  const { isSelected, isFull, toggle } = useCompare()
  const selected = isSelected(item.id)
  const disabled = !selected && isFull
  return (
    <label className={`inline-flex items-center gap-2 text-sm ${disabled ? 'cursor-not-allowed text-ivory/55' : 'cursor-pointer text-ivory/75'}`}>
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled}
        onChange={() => toggle(item)}
        className="h-4 w-4 rounded border-ivory/30 accent-[#F0B27A]"
      />
      {disabled ? `Compare up to ${MAX_COMPARE}` : 'Add to compare'}
    </label>
  )
}

// Toolbar checkbox: reflects whether a comparison is in progress; unchecking clears it
export function CompareModeToggle() {
  const { items, clear } = useCompare()
  const active = items.length > 0
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ivory/75">
      <input
        type="checkbox"
        checked={active}
        onChange={() => (active ? clear() : document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }))}
        className="h-4 w-4 rounded border-ivory/30 accent-[#F0B27A]"
      />
      Compare vehicles{active && ` (${items.length})`}
    </label>
  )
}

// Fixed tray that appears once a vehicle is added to compare
export function CompareTray() {
  const { items, toggle, clear } = useCompare()
  if (items.length === 0) return null
  const href = `/inventory/compare?ids=${items.map((i) => i.id).join(',')}`
  return (
    <div className="sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-ivory/15 bg-[#0c1e33]/85 px-4 py-3 text-ivory shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-site flex-wrap items-center gap-3">
        <GitCompareArrows className="hidden h-5 w-5 text-[#F0B27A] sm:block" aria-hidden="true" />
        <ul className="flex flex-1 flex-wrap gap-2">
          {items.map((item) => (
            <li key={item.id} className="inline-flex items-center gap-1.5 rounded-full border border-ivory/20 bg-ivory/10 px-3 py-1 text-sm text-ivory">
              {item.title}
              <button type="button" onClick={() => toggle(item)} aria-label={`Remove ${item.title} from compare`} className="rounded-full text-ivory/60 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A]">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={clear} className="text-sm font-medium text-ivory/75 hover:text-ivory">
          Clear
        </button>
        {items.length >= 2 ? (
          <Link href={href} className="rounded-xl bg-ivory px-5 py-2.5 text-sm font-semibold text-navy hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]">
            Compare {items.length}
          </Link>
        ) : (
          <span className="text-sm text-ivory/75">Select one more to compare</span>
        )}
      </div>
    </div>
  )
}

export function SavedCarsMenu() {
  const { items, remove } = useSavedCars()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-2 rounded-xl border border-ivory/25 bg-ivory/[0.08] px-4 py-2.5 text-sm font-semibold text-ivory backdrop-blur-md transition-colors hover:border-ivory/40 hover:bg-ivory/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]"
      >
        <Heart className="h-5 w-5" aria-hidden="true" />
        Saved cars
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ivory/15 px-1.5 text-xs">{items.length}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-ivory/15 bg-[#0c1e33]/85 p-3 text-ivory shadow-xl backdrop-blur-xl">
          {items.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-ivory/75">
              Tap the <Heart className="inline h-4 w-4 text-ivory" aria-label="heart" /> on any car to save it here.
            </p>
          ) : (
            <ul className="max-h-96 space-y-2 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-ivory/10">
                  {item.image && (
                    <Image src={item.image} alt="" width={64} height={48} sizes="64px" className="h-12 w-16 flex-shrink-0 rounded-lg object-cover" />
                  )}
                  <Link href={item.href} onClick={() => setOpen(false)} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ivory">{item.title}</span>
                    <span className="block text-sm text-[#F0B27A]">${item.price.toLocaleString()}</span>
                  </Link>
                  <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.title}`} className="rounded-md p-1 text-ivory/60 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A]">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export function SortSelect({ options, value }: { options: Array<{ value: string; label: string }>; value: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Sort vehicles</span>
      <select
        value={value}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete('page')
          if (e.target.value === 'newest') params.delete('sort')
          else params.set('sort', e.target.value)
          const qs = params.toString()
          router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
        }}
        className="appearance-none rounded-xl border border-ivory/20 bg-ivory/[0.08] py-2.5 pl-4 pr-10 text-sm font-medium text-ivory focus:border-[#F0B27A] focus:outline-none focus:ring-2 focus:ring-[#F0B27A]/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            Sort: {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-ivory/75" aria-hidden="true" />
    </label>
  )
}
