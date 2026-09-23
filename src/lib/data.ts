/**
 * Data access layer - always uses Prisma to query the real database.
 *
 * Reads are cached with unstable_cache under the VEHICLES_TAG tag; admin mutations call
 * revalidateTag(VEHICLES_TAG) so public pages update immediately after inventory changes.
 */

import { unstable_cache } from 'next/cache'
import type { Prisma, Vehicle as PrismaVehicle } from '@prisma/client'
import type { Vehicle } from '@/types'
import { prisma } from './prisma'
import { slugify } from './seo'

export const VEHICLES_TAG = 'vehicles'
const CACHE_SECONDS = 300

// unstable_cache JSON-serializes results, so Dates cross the cache as strings and are rehydrated here
type CachedVehicle = Omit<Vehicle, 'createdAt' | 'updatedAt'> & { createdAt: string | Date; updatedAt: string | Date }

function serialize(v: PrismaVehicle): CachedVehicle {
  return { ...v, price: Number(v.price) }
}

function hydrate(v: CachedVehicle): Vehicle {
  return { ...v, createdAt: new Date(v.createdAt), updatedAt: new Date(v.updatedAt) }
}

function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) {
  return unstable_cache(fn, [key], { tags: [VEHICLES_TAG], revalidate: CACHE_SECONDS })
}

export interface GetVehiclesOptions {
  make?: string
  model?: string
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  condition?: string
  bodyStyle?: string
  // Landing pages match the model name exactly; the filter UI does a substring match
  exactModel?: boolean
  mileageMax?: number
  // Free-text search across make, model, trim, and body style ("camry xse", "honda sedan")
  q?: string
  sort?: VehicleSort
  page?: number
  limit?: number
}

export const VEHICLE_SORTS = {
  newest: { label: 'Newest first', orderBy: { createdAt: 'desc' } },
  'price-asc': { label: 'Price: low to high', orderBy: { price: 'asc' } },
  'price-desc': { label: 'Price: high to low', orderBy: { price: 'desc' } },
  'mileage-asc': { label: 'Lowest mileage', orderBy: { mileage: 'asc' } },
  'year-desc': { label: 'Year: newest', orderBy: { year: 'desc' } },
} satisfies Record<string, { label: string; orderBy: Prisma.VehicleOrderByWithRelationInput }>

export type VehicleSort = keyof typeof VEHICLE_SORTS

export function isVehicleSort(value: string | undefined): value is VehicleSort {
  return !!value && value in VEHICLE_SORTS
}

const getVehiclesCached = cached(async (opts: GetVehiclesOptions) => {
  const { page = 1, limit = 12, sort = 'newest', ...filters } = opts
  const terms = filters.q?.trim().split(/\s+/).filter(Boolean).slice(0, 5) ?? []

  const where: Prisma.VehicleWhereInput = {
    status: 'AVAILABLE',
    ...(filters.make && { make: { equals: filters.make, mode: 'insensitive' } }),
    ...(filters.model && {
      model: filters.exactModel
        ? { equals: filters.model, mode: 'insensitive' }
        : { contains: filters.model, mode: 'insensitive' },
    }),
    ...(filters.bodyStyle && { bodyStyle: { equals: filters.bodyStyle, mode: 'insensitive' } }),
    ...(filters.condition && { condition: filters.condition as 'NEW' | 'USED' | 'CERTIFIED' }),
    year: {
      ...(filters.yearMin && { gte: filters.yearMin }),
      ...(filters.yearMax && { lte: filters.yearMax }),
    },
    price: {
      ...(filters.priceMin && { gte: filters.priceMin }),
      ...(filters.priceMax && { lte: filters.priceMax }),
    },
    ...(filters.mileageMax && { mileage: { lte: filters.mileageMax } }),
    // Every search term must match at least one text field
    ...(terms.length > 0 && {
      AND: terms.map((term) => ({
        OR: (['make', 'model', 'trim', 'bodyStyle', 'exteriorColor'] as const).map((field) => ({
          [field]: { contains: term, mode: 'insensitive' as const },
        })),
      })),
    }),
  }

  const [raw, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: [VEHICLE_SORTS[sort].orderBy, { id: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ])

  return { vehicles: raw.map(serialize), total }
}, 'getVehicles')

export async function getVehicles(
  opts: GetVehiclesOptions = {}
): Promise<{ vehicles: Vehicle[]; total: number }> {
  const { vehicles, total } = await getVehiclesCached(opts)
  return { vehicles: vehicles.map(hydrate), total }
}

const getVehicleBySlugCached = cached(async (slug: string) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { slug } })
  return vehicle ? serialize(vehicle) : null
}, 'getVehicleBySlug')

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!slug) {
    console.error('getVehicleBySlug: slug is required')
    return null
  }
  const vehicle = await getVehicleBySlugCached(slug)
  return vehicle ? hydrate(vehicle) : null
}

const getVehicleByVinCached = cached(async (vin: string) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { vin } })
  return vehicle ? serialize(vehicle) : null
}, 'getVehicleByVin')

export async function getVehicleByVin(vin: string): Promise<Vehicle | null> {
  if (!vin) {
    console.error('getVehicleByVin: vin is required')
    return null
  }
  const vehicle = await getVehicleByVinCached(vin)
  return vehicle ? hydrate(vehicle) : null
}

// Vehicles for the compare page, in the order requested (any status, so a sold car still shows)
const getVehiclesByIdsCached = cached(async (ids: string[]) => {
  const raw = await prisma.vehicle.findMany({ where: { id: { in: ids } } })
  return ids.map((id) => raw.find((v) => v.id === id)).filter((v): v is PrismaVehicle => Boolean(v)).map(serialize)
}, 'getVehiclesByIds')

export async function getVehiclesByIds(ids: string[]): Promise<Vehicle[]> {
  if (ids.length === 0) return []
  return (await getVehiclesByIdsCached(ids)).map(hydrate)
}

// Same body style or make, closest in price — powers "Similar vehicles" on VDPs
const getSimilarVehiclesCached = cached(
  async (id: string, make: string, bodyStyle: string | null, price: number, limit: number) => {
    const raw = await prisma.vehicle.findMany({
      where: {
        status: 'AVAILABLE',
        id: { not: id },
        OR: [{ make }, ...(bodyStyle ? [{ bodyStyle }] : [])],
      },
      take: 24,
    })
    return raw
      .map(serialize)
      .sort((a, b) => Math.abs(a.price - price) - Math.abs(b.price - price))
      .slice(0, limit)
  },
  'getSimilarVehicles'
)

export async function getSimilarVehicles(vehicle: Vehicle, limit = 3): Promise<Vehicle[]> {
  const similar = await getSimilarVehiclesCached(vehicle.id, vehicle.make, vehicle.bodyStyle, vehicle.price, limit)
  return similar.map(hydrate)
}

// ─── Inventory facets (make / model / body style landing pages) ─────────────

export interface ModelFacet {
  name: string
  slug: string
  count: number
  minPrice: number
}

export interface MakeFacet {
  name: string
  slug: string
  count: number
  minPrice: number
  models: ModelFacet[]
}

export interface BodyStyleFacet {
  name: string
  slug: string
  count: number
  minPrice: number
}

export const getInventoryFacets = cached(async () => {
  const [byModel, byBody, ranges] = await Promise.all([
    prisma.vehicle.groupBy({
      by: ['make', 'model'],
      where: { status: 'AVAILABLE' },
      _count: { _all: true },
      _min: { price: true },
    }),
    prisma.vehicle.groupBy({
      by: ['bodyStyle'],
      where: { status: 'AVAILABLE', bodyStyle: { not: null } },
      _count: { _all: true },
      _min: { price: true },
    }),
    prisma.vehicle.aggregate({
      where: { status: 'AVAILABLE' },
      _min: { year: true },
      _max: { year: true, price: true },
    }),
  ])

  const makes = new Map<string, MakeFacet>()
  for (const row of byModel) {
    const makeSlug = slugify(row.make)
    const count = row._count._all
    const minPrice = Number(row._min.price ?? 0)
    const make = makes.get(makeSlug) ?? { name: row.make, slug: makeSlug, count: 0, minPrice, models: [] }
    make.count += count
    make.minPrice = Math.min(make.minPrice, minPrice)
    const modelSlug = slugify(row.model)
    const existing = make.models.find((m) => m.slug === modelSlug)
    if (existing) {
      existing.count += count
      existing.minPrice = Math.min(existing.minPrice, minPrice)
    } else {
      make.models.push({ name: row.model, slug: modelSlug, count, minPrice })
    }
    makes.set(makeSlug, make)
  }

  const bodyStyles = new Map<string, BodyStyleFacet>()
  for (const row of byBody) {
    if (!row.bodyStyle) continue
    const bodySlug = slugify(row.bodyStyle)
    const style = bodyStyles.get(bodySlug) ?? { name: row.bodyStyle, slug: bodySlug, count: 0, minPrice: Number(row._min.price ?? 0) }
    style.count += row._count._all
    style.minPrice = Math.min(style.minPrice, Number(row._min.price ?? 0))
    bodyStyles.set(bodySlug, style)
  }

  const byCount = <T extends { count: number; name: string }>(a: T, b: T) => b.count - a.count || a.name.localeCompare(b.name)
  return {
    makes: [...makes.values()]
      .map((m) => ({ ...m, models: m.models.sort(byCount) }))
      .sort(byCount),
    bodyStyles: [...bodyStyles.values()].sort(byCount),
    // Bounds for the filter controls (year selects, price slider)
    yearMin: ranges._min.year,
    yearMax: ranges._max.year,
    priceMax: Number(ranges._max.price ?? 0),
  }
}, 'getInventoryFacets')
