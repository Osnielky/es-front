import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eandscars.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/inventory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Condition filter pages for SEO
  const conditionPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/inventory?condition=NEW`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/inventory?condition=USED`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/inventory?condition=CERTIFIED`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // Dynamic vehicle pages
  let vehiclePages: MetadataRoute.Sitemap = []

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      select: { vin: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    vehiclePages = vehicles.map((vehicle) => ({
      url: `${SITE_URL}/inventory/${vehicle.vin}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    // If database is unavailable, return static pages only
    console.error('Sitemap: Failed to fetch vehicles', error)
  }

  return [...staticPages, ...conditionPages, ...vehiclePages]
}
