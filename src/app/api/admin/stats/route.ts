import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken, getAdminCookieName } from '@/lib/admin-auth'

async function isAdmin(request: NextRequest) {
  const token = request.cookies.get(getAdminCookieName())?.value
  if (!token) return false
  return Boolean(await verifyAdminToken(token))
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [totalVehicles, availableVehicles, soldVehicles, pendingVehicles, totalLeads, recentLeads, recentVehicles] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'SOLD' } }),
    prisma.vehicle.count({ where: { status: 'PENDING' } }),
    prisma.lead.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        slug: true,
        make: true,
        model: true,
        year: true,
        price: true,
        status: true,
        createdAt: true,
      },
    }),
  ])

  // Calculate average price
  const avgPriceResult = await prisma.vehicle.aggregate({
    _avg: { price: true },
  })
  const avgPrice = avgPriceResult._avg.price ? Number(avgPriceResult._avg.price) : 0

  // Count leads by type
  const leadsByType = await prisma.lead.groupBy({
    by: ['type'],
    _count: true,
  })

  // Vehicles added this month
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const vehiclesThisMonth = await prisma.vehicle.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  })

  return NextResponse.json({
    statistics: {
      totalVehicles,
      availableVehicles,
      soldVehicles,
      pendingVehicles,
      totalLeads,
      avgPrice,
      vehiclesThisMonth,
    },
    leadsByType: Object.fromEntries(
      leadsByType.map((item) => [item.type, item._count])
    ),
    recentLeads: recentLeads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      type: lead.type,
      createdAt: lead.createdAt,
    })),
    recentVehicles: recentVehicles.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
  })
}
