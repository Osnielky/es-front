import { Barlow, Barlow_Condensed } from 'next/font/google'

// Body face. Applied once on <html> in app/layout.tsx as --font-barlow (Tailwind `font-sans`).
export const sans = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

// Display face for headings, prices and buttons (Tailwind `font-display`).
export const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})
