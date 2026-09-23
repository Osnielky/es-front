'use client'

// Saved cars + compare selection, kept in localStorage (per browser, no account needed).
// Components subscribe with useSavedCars / useCompare and stay in sync across tabs.
import { useSyncExternalStore } from 'react'
import { MAX_COMPARE } from './vehicle-display'

export { MAX_COMPARE }

export interface ShortlistItem {
  id: string
  title: string
  href: string
  image?: string
  price: number
}

const KEYS = { saved: 'es:saved-cars', compare: 'es:compare' } as const
type ListName = keyof typeof KEYS

const EMPTY: ShortlistItem[] = []
const cache: Partial<Record<ListName, { raw: string | null; items: ShortlistItem[] }>> = {}
const listeners = new Set<() => void>()

function read(list: ListName): ShortlistItem[] {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(KEYS[list])
  } catch {
    return EMPTY
  }
  // Return a stable reference while storage is unchanged (required by useSyncExternalStore)
  const hit = cache[list]
  if (hit && hit.raw === raw) return hit.items
  let items = EMPTY
  try {
    const parsed = raw ? JSON.parse(raw) : []
    items = Array.isArray(parsed) ? parsed : EMPTY
  } catch {
    items = EMPTY
  }
  cache[list] = { raw, items }
  return items
}

function write(list: ListName, items: ShortlistItem[]) {
  try {
    window.localStorage.setItem(KEYS[list], JSON.stringify(items))
  } catch {
    // Private mode / storage full: the UI simply won't persist
  }
  listeners.forEach((notify) => notify())
}

function subscribe(notify: () => void) {
  listeners.add(notify)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEYS.saved || e.key === KEYS.compare) notify()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(notify)
    window.removeEventListener('storage', onStorage)
  }
}

function useList(list: ListName) {
  return useSyncExternalStore(subscribe, () => read(list), () => EMPTY)
}

export function useSavedCars() {
  const items = useList('saved')
  return {
    items,
    isSaved: (id: string) => items.some((i) => i.id === id),
    toggle: (item: ShortlistItem) =>
      write('saved', items.some((i) => i.id === item.id) ? items.filter((i) => i.id !== item.id) : [item, ...items]),
    remove: (id: string) => write('saved', items.filter((i) => i.id !== id)),
  }
}

export function useCompare() {
  const items = useList('compare')
  return {
    items,
    isSelected: (id: string) => items.some((i) => i.id === id),
    isFull: items.length >= MAX_COMPARE,
    toggle: (item: ShortlistItem) => {
      if (items.some((i) => i.id === item.id)) write('compare', items.filter((i) => i.id !== item.id))
      else if (items.length < MAX_COMPARE) write('compare', [...items, item])
    },
    clear: () => write('compare', []),
  }
}
