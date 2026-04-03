import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { LOCATION } from '@/lib/seo'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? '(239) 555-0123'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e40af' },
    { media: '(prefers-color-scheme: dark)', color: '#1e3a8a' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${DEALER_NAME} | New & Used Cars in Naples, FL`,
    template: `%s | ${DEALER_NAME}`,
  },
  description: `${DEALER_NAME} - Your trusted car dealership in Naples, Florida. Browse new and used vehicles, certified pre-owned cars, easy financing, and trade-in options. Serving ${LOCATION.nearbyAreas.join(', ')}, and all of Southwest Florida.`,
  keywords: [
    'car dealer Naples FL',
    'used cars Naples Florida',
    'new cars Naples',
    'car dealership Naples',
    'auto dealer Naples FL',
    'buy car Naples',
    'certified pre-owned Naples',
    'car financing Naples FL',
    'trade in car Naples',
    'Southwest Florida car dealer',
    'Collier County auto dealer',
    ...LOCATION.nearbyAreas.map(area => `car dealer ${area}`),
  ],
  authors: [{ name: DEALER_NAME }],
  creator: DEALER_NAME,
  publisher: DEALER_NAME,
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  category: 'Automotive',
  classification: 'Auto Dealer',
  openGraph: {
    type: 'website',
    siteName: DEALER_NAME,
    locale: 'en_US',
    title: `${DEALER_NAME} | New & Used Cars in Naples, FL`,
    description: `Your trusted car dealership in Naples, Florida. Quality vehicles, transparent pricing, and exceptional service. Serving Southwest Florida.`,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${DEALER_NAME} - Car Dealer in Naples, FL`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${DEALER_NAME} | New & Used Cars in Naples, FL`,
    description: `Your trusted car dealership in Naples, Florida. Quality vehicles, transparent pricing, and exceptional service.`,
    images: [`${SITE_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these when you have the verification codes
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    'geo.region': 'US-FL',
    'geo.placename': 'Naples',
    'geo.position': `${LOCATION.latitude};${LOCATION.longitude}`,
    'ICBM': `${LOCATION.latitude}, ${LOCATION.longitude}`,
    'business:contact_data:street_address': process.env.NEXT_PUBLIC_DEALER_ADDRESS ?? '',
    'business:contact_data:locality': LOCATION.city,
    'business:contact_data:region': LOCATION.stateCode,
    'business:contact_data:postal_code': LOCATION.zipCode,
    'business:contact_data:country_name': 'United States',
    'business:contact_data:phone_number': DEALER_PHONE,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
