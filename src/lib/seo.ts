// SEO Configuration for Naples, FL Car Dealer
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? '(239) 555-0123'
const DEALER_EMAIL = process.env.NEXT_PUBLIC_DEALER_EMAIL ?? 'info@eandscars.com'
const DEALER_ADDRESS = process.env.NEXT_PUBLIC_DEALER_ADDRESS ?? '1234 Tamiami Trail N, Naples, FL 34102'

// Naples, FL location details for local SEO
export const LOCATION = {
  city: 'Naples',
  state: 'Florida',
  stateCode: 'FL',
  zipCode: '34102',
  county: 'Collier County',
  latitude: 26.1420,
  longitude: -81.7948,
  nearbyAreas: ['Marco Island', 'Bonita Springs', 'Fort Myers', 'Estero', 'Golden Gate', 'Immokalee'],
  serviceArea: 'Southwest Florida',
}

// ═══════════════════════════════════════════════════════════════════
// Vehicle SEO Helpers
// ═══════════════════════════════════════════════════════════════════

export function buildVehicleTitle(
  year: number,
  make: string,
  model: string,
  trim?: string | null
) {
  const base = trim ? `${year} ${make} ${model} ${trim}` : `${year} ${make} ${model}`
  return `${base} for Sale in Naples FL | ${DEALER_NAME}`
}

export function buildVehicleDescription(
  year: number,
  make: string,
  model: string,
  price: number,
  mileage: number
) {
  return `${year} ${make} ${model} for sale at ${DEALER_NAME} in Naples, FL. Price: $${price.toLocaleString()}. Mileage: ${mileage.toLocaleString()} miles. Visit our Naples dealership or browse our full inventory online. Serving Southwest Florida.`
}

export function buildVehicleKeywords(
  year: number,
  make: string,
  model: string,
  condition: string
) {
  const conditionText = condition.toLowerCase()
  return [
    `${year} ${make} ${model}`,
    `${make} ${model} for sale`,
    `${conditionText} ${make} ${model}`,
    `${make} dealer Naples FL`,
    `${make} ${model} Naples Florida`,
    `buy ${make} ${model}`,
    `${conditionText} cars Naples FL`,
    `car dealership Naples`,
  ].join(', ')
}

export function buildVehicleJsonLd(vehicle: {
  slug?: string
  make: string
  model: string
  year: number
  price: number
  images: string[]
  description?: string | null
  vin?: string | null
  mileage: number
  condition: string
  status?: string
  trim?: string | null
  fuelType?: string | null
  transmission?: string | null
  exteriorColor?: string | null
  bodyStyle?: string | null
  engine?: string | null
}) {
  const availability = vehicle.status === 'SOLD' 
    ? 'https://schema.org/SoldOut' 
    : vehicle.status === 'PENDING'
    ? 'https://schema.org/LimitedAvailability'
    : 'https://schema.org/InStock'

  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
    brand: {
      '@type': 'Brand',
      name: vehicle.make,
    },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: 'USD',
      availability,
      seller: {
        '@type': 'AutoDealer',
        name: DEALER_NAME,
        address: buildPostalAddress(),
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    image: vehicle.images.length > 0 ? vehicle.images : undefined,
    description: vehicle.description ?? `${vehicle.year} ${vehicle.make} ${vehicle.model} available at ${DEALER_NAME} in Naples, FL.`,
    vehicleIdentificationNumber: vehicle.vin ?? undefined,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'SMI',
    },
    itemCondition:
      vehicle.condition === 'NEW'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
    url: `${SITE_URL}/inventory/${vehicle.vin}`,
    fuelType: vehicle.fuelType ?? undefined,
    vehicleTransmission: vehicle.transmission ?? undefined,
    color: vehicle.exteriorColor ?? undefined,
    bodyType: vehicle.bodyStyle ?? undefined,
    vehicleEngine: vehicle.engine ? { '@type': 'EngineSpecification', name: vehicle.engine } : undefined,
  }
}

// ═══════════════════════════════════════════════════════════════════
// Dealer / Business SEO Helpers
// ═══════════════════════════════════════════════════════════════════

function buildPostalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: DEALER_ADDRESS.split(',')[0],
    addressLocality: LOCATION.city,
    addressRegion: LOCATION.stateCode,
    postalCode: LOCATION.zipCode,
    addressCountry: 'US',
  }
}

export function buildDealerJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    '@id': `${SITE_URL}/#organization`,
    name: DEALER_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpeg`,
    image: `${SITE_URL}/logo.jpeg`,
    telephone: DEALER_PHONE,
    email: DEALER_EMAIL,
    address: buildPostalAddress(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: LOCATION.latitude,
      longitude: LOCATION.longitude,
    },
    areaServed: [
      { '@type': 'City', name: LOCATION.city },
      ...LOCATION.nearbyAreas.map(area => ({ '@type': 'City', name: area })),
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '11:00',
        closes: '17:00',
      },
    ],
    priceRange: '$$',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Cash, Credit Card, Financing',
    sameAs: [
      // Add social media URLs when available
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Vehicle Inventory',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Car', name: 'New Vehicles' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Car', name: 'Used Vehicles' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Car', name: 'Certified Pre-Owned' } },
      ],
    },
  }
}

export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: DEALER_NAME,
    image: `${SITE_URL}/logo.jpeg`,
    telephone: DEALER_PHONE,
    email: DEALER_EMAIL,
    url: SITE_URL,
    address: buildPostalAddress(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: LOCATION.latitude,
      longitude: LOCATION.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '11:00',
        closes: '17:00',
      },
    ],
  }
}

// ═══════════════════════════════════════════════════════════════════
// Breadcrumb SEO Helper
// ═══════════════════════════════════════════════════════════════════

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

// ═══════════════════════════════════════════════════════════════════
// Inventory Page SEO Helper
// ═══════════════════════════════════════════════════════════════════

export function buildInventoryJsonLd(vehicles: Array<{
  vin?: string | null
  make: string
  model: string
  year: number
  price: number
  images: string[]
  mileage: number
  condition: string
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Vehicles for Sale at ${DEALER_NAME}`,
    description: `Browse ${vehicles.length} vehicles available at ${DEALER_NAME} in Naples, FL`,
    numberOfItems: vehicles.length,
    itemListElement: vehicles.slice(0, 10).map((vehicle, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Car',
        name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        url: `${SITE_URL}/inventory/${vehicle.vin}`,
        image: vehicle.images[0],
        offers: {
          '@type': 'Offer',
          price: vehicle.price,
          priceCurrency: 'USD',
        },
      },
    })),
  }
}

// ═══════════════════════════════════════════════════════════════════
// FAQ SEO Helper (for contact/about pages)
// ═══════════════════════════════════════════════════════════════════

export function buildFAQJsonLd() {
  const faqs = [
    {
      question: 'What financing options do you offer?',
      answer: `At ${DEALER_NAME}, we offer flexible financing options for all credit situations. Get pre-approved in minutes with competitive rates. We work with multiple lenders to find the best terms for you.`,
    },
    {
      question: 'Do you accept trade-ins?',
      answer: 'Yes! We accept trade-ins and offer competitive market value for your current vehicle. The trade-in value can be applied directly to your new purchase.',
    },
    {
      question: 'Where are you located?',
      answer: `We are located at ${DEALER_ADDRESS}. We proudly serve Naples, Marco Island, Bonita Springs, Fort Myers, and all of Southwest Florida.`,
    },
    {
      question: 'What are your business hours?',
      answer: 'We are open Monday through Saturday from 9am to 7pm, and Sunday from 11am to 5pm.',
    },
    {
      question: 'Do you offer test drives?',
      answer: 'Absolutely! Schedule a test drive online or call us at ' + DEALER_PHONE + '. We can work around your schedule to find a convenient time.',
    },
    {
      question: 'Are your vehicles inspected?',
      answer: 'Yes, every vehicle passes a comprehensive 150-point inspection before being listed. We ensure quality and reliability for all our customers.',
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// ═══════════════════════════════════════════════════════════════════
// Website SEO Helper
// ═══════════════════════════════════════════════════════════════════

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: DEALER_NAME,
    url: SITE_URL,
    description: `${DEALER_NAME} - Your trusted car dealership in Naples, Florida. Browse new and used vehicles, get financing, and find your perfect car.`,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/inventory?make={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ═══════════════════════════════════════════════════════════════════
// Page Metadata Helpers
// ═══════════════════════════════════════════════════════════════════

export const defaultMetadata = {
  siteName: DEALER_NAME,
  siteUrl: SITE_URL,
  locale: 'en_US',
  type: 'website' as const,
}

export function buildPageMetadata(options: {
  title: string
  description: string
  path?: string
  image?: string
  keywords?: string[]
  noIndex?: boolean
}) {
  const url = options.path ? `${SITE_URL}${options.path}` : SITE_URL
  const image = options.image ?? `${SITE_URL}/og-image.jpg`

  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords?.join(', '),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      siteName: DEALER_NAME,
      locale: 'en_US',
      type: 'website' as const,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: options.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: options.title,
      description: options.description,
      images: [image],
    },
    robots: options.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
