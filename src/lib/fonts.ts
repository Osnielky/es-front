import { Cormorant_Garamond } from 'next/font/google'

// Restrained serif for short editorial headings on the vehicle detail page.
// Applied by adding `serif.variable` to the page wrapper, so other routes don't download it.
export const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-serif',
  display: 'swap',
})
