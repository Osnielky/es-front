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

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalVehicles,
    availableVehicles,
    soldVehicles,
    pendingVehicles,
    totalLeads,
    leadsThisMonth,
    leadsLastMonth,
    leadsThisWeek,
    whatsappTotal,
    whatsappThisMonth,
    leadsByType,
    avgPriceResult,
    vehiclesThisMonth,
    recentLeads,
    allVehicles,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'SOLD' } }),
    prisma.vehicle.count({ where: { status: 'PENDING' } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.lead.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.lead.count({ where: { type: 'WHATSAPP' } }),
    prisma.lead.count({ where: { type: 'WHATSAPP', createdAt: { gte: startOfThisMonth } } }),
    prisma.lead.groupBy({ by: ['type'], _count: true }),
    prisma.vehicle.aggregate({ _avg: { price: true } }),
    prisma.vehicle.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      where: {
        // Exclude internal WhatsApp tracking records without real contact info
        NOT: { email: 'whatsapp@tracked.internal' },
      },
    }),
    prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, slug: true, vin: true, make: true, model: true,
        year: true, price: true, status: true, condition: true,
        images: true, createdAt: true,
      },
    }),
  ])

  const avgPrice = avgPriceResult._avg.price ? Number(avgPriceResult._avg.price) : 0
  const leadGrowth = leadsLastMonth > 0
    ? Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100)
    : leadsThisMonth > 0 ? 100 : 0

  return NextResponse.json({
    statistics: {
      totalVehicles,
      availableVehicles,
      soldVehicles,
      pendingVehicles,
      totalLeads,
      leadsThisMonth,
      leadsThisWeek,
      leadGrowth,
      whatsappTotal,
      whatsappThisMonth,
      avgPrice,
      vehiclesThisMonth,
    },
    leadsByType: Object.fromEntries(leadsByType.map((item) => [item.type, item._count])),
    recentLeads: recentLeads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      type: lead.type,
      vehicleId: lead.vehicleId,
      createdAt: lead.createdAt,
    })),
    allVehicles: allVehicles.map((v) => ({ ...v, price: Number(v.price) })),
  })
}
