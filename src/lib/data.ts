/**
 * Data access layer.
 * When DATABASE_URL is not set (local UI dev), returns mock data.
 * When DATABASE_URL is set, queries the real database via Prisma.
 */

import type { Vehicle } from '@/types'
import { mockVehicles } from './mock-data'

const USE_MOCK = !process.env.DATABASE_URL || process.env.DATABASE_URL === ''

export interface GetVehiclesOptions {
  make?: string
  model?: string
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  condition?: string
  bodyStyle?: string
  page?: number
  limit?: number
}

export async function getVehicles(
  opts: GetVehiclesOptions = {}
): Promise<{ vehicles: Vehicle[]; total: number }> {
  const { page = 1, limit = 12, ...filters } = opts

  if (USE_MOCK) {
    let results = mockVehicles.filter((v) => v.status === 'AVAILABLE')
    if (filters.make) results = results.filter((v) => v.make === filters.make)
    if (filters.condition) results = results.filter((v) => v.condition === filters.condition)
    if (filters.bodyStyle) results = results.filter((v) => v.bodyStyle === filters.bodyStyle)
    if (filters.yearMin) results = results.filter((v) => v.year >= filters.yearMin!)
    if (filters.yearMax) results = results.filter((v) => v.year <= filters.yearMax!)
    if (filters.priceMin) results = results.filter((v) => v.price >= filters.priceMin!)
    if (filters.priceMax) results = results.filter((v) => v.price <= filters.priceMax!)
    const total = results.length
    const vehicles = results.slice((page - 1) * limit, page * limit)
    return { vehicles, total }
  }

  const { prisma } = await import('./prisma')
  const where = {
    status: 'AVAILABLE' as const,
    ...(filters.make && { make: filters.make }),
    ...(filters.model && { model: { contains: filters.model, mode: 'insensitive' as const } }),
    ...(filters.condition && { condition: filters.condition as 'NEW' | 'USED' | 'CERTIFIED' }),
    year: {
      ...(filters.yearMin && { gte: filters.yearMin }),
      ...(filters.yearMax && { lte: filters.yearMax }),
    },
    price: {
      ...(filters.priceMin && { gte: filters.priceMin }),
      ...(filters.priceMax && { lte: filters.priceMax }),
    },
  }

  const [raw, total] = await Promise.all([
    prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.vehicle.count({ where }),
  ])

  const vehicles = raw.map((v: typeof raw[number]) => ({ ...v, price: Number(v.price) }))
  return { vehicles, total }
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (USE_MOCK) {
    return mockVehicles.find((v) => v.slug === slug) ?? null
  }

  const { prisma } = await import('./prisma')
  const vehicle = await prisma.vehicle.findUnique({ where: { slug } })
  if (!vehicle) return null
  return { ...vehicle, price: Number(vehicle.price) }
}
