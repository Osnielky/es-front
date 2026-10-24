import type { Config } from 'tailwindcss'

/**
 * Brand tokens come from the E&S shield logo: navy, red, white.
 * - `brand`  = navy scale (primary surfaces, nav, headings)
 * - `accent` = red scale (price tags and the single primary action)
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
          600: '#15295A',
          700: '#112149',
          800: '#0C1A3D',
          900: '#08122B',
          950: '#050B1C',
        },
        // Alias kept for the few places that still say `navy`
        navy: {
          50:  '#EEF2FA',
          100: '#D9E1F2',
          200: '#B9C4E0',
          DEFAULT: '#15295A',
          800: '#0C1A3D',
        },
        accent: {
          400: '#E63946',
          500: '#C1121F',
          600: '#A50E19',
        },
        wa: {
          500: '#1FAF54',
          600: '#17883F',
        },
        paper: '#F3F5F9',
        ivory: '#FFFFFF',
        ink: {
          DEFAULT: '#131B2E',
          muted: '#5C6579',
        },
        line: '#D7DCE6',
      },
      screens: {
        // VDP two-column breakpoint (gallery + sections left, sticky contact panel right)
        desk: '1200px',
      },
      fontFamily: {
        sans: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        display: ['var(--font-barlow-condensed)', 'Arial Narrow', 'sans-serif'],
      },
      borderRadius: {
        panel: '8px',
      },
      maxWidth: {
        // Shared page width for the header and inventory pages (1536px, 1760px from 1800px screens); see --site-max
        site: 'var(--site-max)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, #15295A 0%, #0C1A3D 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)',
      },
      boxShadow: {
        'glow': '0 10px 30px -12px rgba(193, 18, 31, 0.45)',
        'glow-accent': '0 10px 30px -12px rgba(193, 18, 31, 0.45)',
        'card-hover': '0 20px 40px -24px rgba(12, 26, 61, 0.35)',
        panel: '0 1px 2px rgba(20,36,59,0.04), 0 8px 24px -12px rgba(20,36,59,0.12)',
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
