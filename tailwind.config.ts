import type { Config } from 'tailwindcss'

/**
 * Theme: light and airy. White frosted cards over a soft sky/gold backdrop, navy for headings and
 * buttons, gold for accents (eyebrows, icons, highlighted words). WhatsApp keeps its own green.
 * - `brand`  = navy scale
 * - `accent` = gold scale (600+ is readable as small text on white)
 * - `wa`     = WhatsApp green (semantic, used only for the WhatsApp action)
 * - `paper` / `ink` / `line` = page background, text, hairlines
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEF2FA',
          100: '#D9E1F2',
          200: '#B9C4E0',
          300: '#8E9FC9',
          400: '#5F75AE',
          500: '#3A5290',
          600: '#1B2D5B',
          700: '#15254B',
          800: '#0F1B3A',
          900: '#0A122B',
          950: '#050B1C',
        },
        navy: {
          50:  '#EEF2FA',
          100: '#D9E1F2',
          200: '#B9C4E0',
          DEFAULT: '#1B2D5B',
          800: '#0F1B3A',
        },
        accent: {
          50:  '#FBF7EC',
          100: '#F4EAD0',
          200: '#EAD9A8',
          300: '#DEC37A',
          400: '#D1AD57',
          500: '#C19A3E',
          600: '#9A7A2C',
          700: '#775E20',
        },
        wa: {
          500: '#1FAF54',
          600: '#17883F',
        },
        paper: '#F5F7FB',
        ivory: '#FFFFFF',
        ink: {
          DEFAULT: '#172036',
          muted: '#5C6579',
        },
        line: '#E1E6EF',
      },
      screens: {
        // VDP two-column breakpoint (gallery + sections left, sticky contact panel right)
        desk: '1200px',
      },
      fontFamily: {
        sans: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        display: ['var(--font-barlow-display)', 'var(--font-barlow)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        panel: '16px',
      },
      maxWidth: {
        // Shared page width for the header and inventory pages (1536px, 1760px from 1800px screens); see --site-max
        site: 'var(--site-max)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, #1B2D5B 0%, #0F1B3A 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)',
      },
      boxShadow: {
        'glow': '0 12px 30px -12px rgba(27, 45, 91, 0.45)',
        'glow-accent': '0 12px 30px -12px rgba(193, 154, 62, 0.45)',
        'card-hover': '0 24px 48px -24px rgba(23, 32, 54, 0.28)',
        panel: '0 1px 2px rgba(23,32,54,0.04), 0 12px 32px -16px rgba(23,32,54,0.18)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'scan': 'scan 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scan: {
          '0%, 100%': { top: '0%' },
          '50%': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
}

export default config
