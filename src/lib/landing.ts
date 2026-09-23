// Copy + metadata helpers for make / model / body-style landing pages
import type { Metadata } from 'next'
import type { Vehicle } from '@/types'
import { buildPageMetadata, LOCATION } from './seo'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'

// "Used" only when nothing in the set is new — matches how independent-dealer shoppers search
export function conditionPrefix(vehicles: Pick<Vehicle, 'condition'>[]) {
  return vehicles.length > 0 && vehicles.every((v) => v.condition !== 'NEW') ? 'Used ' : ''
}

export function landingIntro(subject: string, vehicles: Vehicle[], extra?: string) {
  const count = vehicles.length
  const minPrice = Math.min(...vehicles.map((v) => v.price))
  const years = vehicles.map((v) => v.year)
  const yearRange = Math.min(...years) === Math.max(...years) ? `${years[0]}` : `${Math.min(...years)}–${Math.max(...years)}`
  return [
    `Shop ${count} ${subject} ${count === 1 ? 'vehicle' : 'vehicles'} for sale at ${DEALER_NAME} in ${LOCATION.city}, ${LOCATION.stateCode},`,
    `with model years ${yearRange} and prices starting at $${minPrice.toLocaleString()}.`,
    extra,
    `Financing and trade-ins available. Serving ${LOCATION.nearbyAreas.slice(0, 3).join(', ')}, and all of ${LOCATION.serviceArea}.`,
  ]
    .filter(Boolean)
    .join(' ')
}

export function landingMetadata(h1: string, path: string, vehicles: Vehicle[]): Metadata {
  const minPrice = vehicles.length ? Math.min(...vehicles.map((v) => v.price)) : 0
  return buildPageMetadata({
    title: h1,
    description: `${vehicles.length} ${h1.replace(/ for Sale in .*/, '')} in stock at ${DEALER_NAME}${minPrice ? `, from $${minPrice.toLocaleString()}` : ''}. See photos, prices, and specs, then schedule a test drive in ${LOCATION.city}, ${LOCATION.stateCode}.`,
    path,
    image: vehicles[0]?.images[0],
  })
}
