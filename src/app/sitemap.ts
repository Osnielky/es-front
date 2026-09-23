import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getInventoryFacets } from '@/lib/data'
import { vehiclePath, makePath, modelPath, bodyStylePath } from '@/lib/seo'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eandscars.com'

// Rendered per request: a build-time sitemap would be generated without a database (Docker build) and ship empty
export const dynamic = 'force-dynamic'

// Sold VDPs stay listed this long so they can pass visitors to similar vehicles, then drop out
const SOLD_RETENTION_DAYS = 90

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/inventory`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/financing`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/trade-in`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  let landingPages: MetadataRoute.Sitemap = []
  let vehiclePages: MetadataRoute.Sitemap = []

  try {
    const soldCutoff = new Date(now.getTime() - SOLD_RETENTION_DAYS * 24 * 60 * 60 * 1000)
    const [facets, vehicles] = await Promise.all([
      getInventoryFacets(),
      prisma.vehicle.findMany({
        where: {
          OR: [{ status: { in: ['AVAILABLE', 'PENDING'] } }, { status: 'SOLD', updatedAt: { gte: soldCutoff } }],
        },
        select: { vin: true, slug: true, updatedAt: true, status: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    landingPages = [
      ...facets.makes.flatMap((make) => [
        { url: `${SITE_URL}${makePath(make.name)}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
        ...make.models.map((model) => ({
          url: `${SITE_URL}${modelPath(make.name, model.name)}`,
          lastModified: now,
          changeFrequency: 'daily' as const,
          priority: 0.8,
        })),
      ]),
      ...facets.bodyStyles.map((style) => ({
        url: `${SITE_URL}${bodyStylePath(style.name)}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      })),
    ]

    vehiclePages = vehicles.map((vehicle) => ({
      url: `${SITE_URL}${vehiclePath(vehicle)}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: vehicle.status === 'SOLD' ? ('monthly' as const) : ('weekly' as const),
      priority: vehicle.status === 'AVAILABLE' ? 0.8 : 0.3,
    }))
  } catch (error) {
    // If database is unavailable, return static pages only
    console.error('Sitemap: Failed to fetch vehicles', error)
  }

  return [...staticPages, ...landingPages, ...vehiclePages]
}
