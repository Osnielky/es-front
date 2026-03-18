import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken, getAdminCookieName } from '@/lib/admin-auth'
import { z } from 'zod'

const createVehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  trim: z.string().optional().nullable(),
  price: z.number().positive(),
  mileage: z.number().int().nonnegative(),
  condition: z.enum(['NEW', 'USED', 'CERTIFIED']),
  bodyStyle: z.string().optional().nullable(),
  transmission: z.string().optional().nullable(),
  fuelType: z.string().optional().nullable(),
  engine: z.string().optional().nullable(),
  exteriorColor: z.string().optional().nullable(),
  interiorColor: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
})

async function isAdmin(request: NextRequest) {
  const token = request.cookies.get(getAdminCookieName())?.value
  if (!token) return false
  return Boolean(await verifyAdminToken(token))
}

function generateSlug(make: string, model: string, year: number, trim?: string | null): string {
  const parts = [year, make, model]
  if (trim) parts.push(trim)
  return parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createVehicleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const slug = generateSlug(parsed.data.make, parsed.data.model, parsed.data.year, parsed.data.trim)

  // Check if slug already exists and make it unique
  const existing = await prisma.vehicle.findUnique({ where: { slug } })
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const vehicle = await prisma.vehicle.create({
    data: {
      slug: finalSlug,
      make: parsed.data.make,
      model: parsed.data.model,
      year: parsed.data.year,
      trim: parsed.data.trim,
      price: parsed.data.price,
      mileage: parsed.data.mileage,
      condition: parsed.data.condition,
      bodyStyle: parsed.data.bodyStyle,
      transmission: parsed.data.transmission,
      fuelType: parsed.data.fuelType,
      engine: parsed.data.engine,
      exteriorColor: parsed.data.exteriorColor,
      interiorColor: parsed.data.interiorColor,
      vin: parsed.data.vin,
      description: parsed.data.description,
      features: parsed.data.features,
      images: parsed.data.images,
      status: 'AVAILABLE',
    },
  })

  return NextResponse.json(
    { success: true, id: vehicle.id, slug: vehicle.slug },
    { status: 201 }
  )
}
