import { NextRequest, NextResponse } from 'next/server'
import { getVehicles } from '@/lib/data'
import { vehicleFilterSchema } from '@/lib/validations/vehicle'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const params = vehicleFilterSchema.safeParse(Object.fromEntries(searchParams))

  if (!params.success) {
    return NextResponse.json({ error: params.error.flatten() }, { status: 400 })
  }

  const { page, limit } = params.data
  const { vehicles, total } = await getVehicles(params.data)

  return NextResponse.json({ vehicles, total, page, totalPages: Math.ceil(total / limit) })
}
