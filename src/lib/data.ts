/**
 * Data access layer - always uses Prisma to query the real database.
 */

import type { Prisma } from '@prisma/client'
import type { Vehicle } from '@/types'
import { prisma } from './prisma'

export type VehicleSort = 'newest' | 'price_asc' | 'price_desc' | 'miles' | 'year'

export const VEHICLE_SORTS: { value: VehicleSort; label: string }[] = [
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'miles', label: 'Lowest miles' },
  { value: 'year', label: 'Year: newest' },
]

const ORDER_BY: Record<VehicleSort, Prisma.VehicleOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  miles: { mileage: 'asc' },
  year: { year: 'desc' },
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
  mileageMax?: number
  sort?: VehicleSort
  page?: number
  limit?: number
}

function toVehicle<T extends { price: Prisma.Decimal | number }>(v: T): T & { price: number } {
  return { ...v, price: Number(v.price) }
}

export async function getVehicles(
  opts: GetVehiclesOptions = {}
): Promise<{ vehicles: Vehicle[]; total: number }> {
  const { page = 1, limit = 12, sort = 'newest', ...filters } = opts

  const where: Prisma.VehicleWhereInput = {
    status: 'AVAILABLE',
    ...(filters.make && { make: { equals: filters.make, mode: 'insensitive' } }),
    ...(filters.model && { model: { contains: filters.model, mode: 'insensitive' } }),
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
  }

  const [raw, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: ORDER_BY[sort] ?? ORDER_BY.newest,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ])

  return { vehicles: raw.map(toVehicle), total }
}

/** Distinct makes and body styles currently on the lot, for filter controls. */
export async function getInventoryFacets(): Promise<{ makes: string[]; bodyStyles: string[] }> {
  const rows = await prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    select: { make: true, bodyStyle: true },
  })
  const makes = Array.from(new Set(rows.map((r) => r.make).filter(Boolean))).sort()
  const bodyStyles = Array.from(
    new Set(rows.map((r) => r.bodyStyle).filter((b): b is string => Boolean(b)))
  ).sort()
  return { makes, bodyStyles }
}

/** Other available vehicles to show under a vehicle page. Same body style first, then newest. */
export async function getRelatedVehicles(vehicle: Vehicle, limit = 3): Promise<Vehicle[]> {
  const base: Prisma.VehicleWhereInput = { status: 'AVAILABLE', id: { not: vehicle.id } }
  const similar = vehicle.bodyStyle
    ? await prisma.vehicle.findMany({
        where: { ...base, bodyStyle: { equals: vehicle.bodyStyle, mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
    : []
  if (similar.length >= limit) return similar.map(toVehicle)

  const rest = await prisma.vehicle.findMany({
    where: { ...base, id: { notIn: [vehicle.id, ...similar.map((s) => s.id)] } },
    orderBy: { createdAt: 'desc' },
    take: limit - similar.length,
  })
  return [...similar, ...rest].map(toVehicle)
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!slug) {
    console.error('getVehicleBySlug: slug is required')
    return null
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { slug } })
  if (!vehicle) return null
  return toVehicle(vehicle)
}

export async function getVehicleByVin(vin: string): Promise<Vehicle | null> {
  if (!vin) {
    console.error('getVehicleByVin: vin is required')
    return null
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { vin } })
  if (!vehicle) return null
  return toVehicle(vehicle)
}
