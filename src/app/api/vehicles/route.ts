import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { vehicleFilterSchema } from '@/lib/validations/vehicle'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const params = vehicleFilterSchema.safeParse(Object.fromEntries(searchParams))

  if (!params.success) {
    return NextResponse.json({ error: params.error.flatten() }, { status: 400 })
  }

  const { make, model, yearMin, yearMax, priceMin, priceMax, condition, bodyStyle, page, limit } =
    params.data

  const where = {
    status: 'AVAILABLE' as const,
    ...(make && { make }),
    ...(model && { model: { contains: model, mode: 'insensitive' as const } }),
    ...(condition && { condition }),
    ...(bodyStyle && { bodyStyle }),
    year: {
      ...(yearMin && { gte: yearMin }),
      ...(yearMax && { lte: yearMax }),
    },
    price: {
      ...(priceMin && { gte: priceMin }),
      ...(priceMax && { lte: priceMax }),
    },
  }

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ])

  return NextResponse.json({ vehicles, total, page, totalPages: Math.ceil(total / limit) })
}
