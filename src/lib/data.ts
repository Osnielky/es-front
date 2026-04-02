/**
 * Data access layer - always uses Prisma to query the real database.
 */

import type { Vehicle } from '@/types'
import { prisma } from './prisma'

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
  if (!slug) {
    console.error('getVehicleBySlug: slug is required')
    return null
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { slug } })
  if (!vehicle) return null
  return { ...vehicle, price: Number(vehicle.price) }
}

export async function getVehicleByVin(vin: string): Promise<Vehicle | null> {
  if (!vin) {
    console.error('getVehicleByVin: vin is required')
    return null
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { vin } })
  if (!vehicle) return null
  return { ...vehicle, price: Number(vehicle.price) }
}
