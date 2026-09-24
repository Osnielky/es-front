import { Cormorant_Garamond } from 'next/font/google'

// Serif for editorial headings across the public site (glass theme). Applied once on <html> in
// app/layout.tsx; body text, forms, prices and specs stay in Inter.
export const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-serif',
  display: 'swap',
})
