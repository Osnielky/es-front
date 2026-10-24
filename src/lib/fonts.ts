import { Barlow } from 'next/font/google'

// Body face (Tailwind `font-sans`). Applied once on <html> in app/layout.tsx.
export const sans = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
})

// Display face for headings, prices and buttons (Tailwind `font-display`): the same family in heavy weights,
// so headings read wide and confident rather than condensed.
export const display = Barlow({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-barlow-display',
  display: 'swap',
})
