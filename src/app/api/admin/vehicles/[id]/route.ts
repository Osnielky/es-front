import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken, getAdminCookieName } from '@/lib/admin-auth'
import { z } from 'zod'

const updateVehicleSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  trim: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  mileage: z.number().int().nonnegative().optional(),
  condition: z.enum(['NEW', 'USED', 'CERTIFIED']).optional(),
  bodyStyle: z.string().optional().nullable(),
  transmission: z.string().optional().nullable(),
  fuelType: z.string().optional().nullable(),
  engine: z.string().optional().nullable(),
  exteriorColor: z.string().optional().nullable(),
  interiorColor: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(['AVAILABLE', 'PENDING', 'SOLD']).optional(),
})

async function isAdmin(request: NextRequest) {
  const token = request.cookies.get(getAdminCookieName())?.value
  if (!token) return false
  return Boolean(await verifyAdminToken(token))
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  })

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...vehicle,
    price: Number(vehicle.price),
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateVehicleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({
    success: true,
    id: vehicle.id,
    price: Number(vehicle.price),
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  await prisma.vehicle.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
