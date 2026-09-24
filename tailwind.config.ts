import type { Config } from 'tailwindcss'

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
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c2d4ff',
          300: '#93b0ff',
          400: '#5e85ff',
          500: '#3358f4',
          600: '#1f3ee8',
          700: '#1a30cc',
          800: '#1c2da6',
          900: '#1a2a80',
          950: '#111a50',
        },
        // Sand + Navy inventory theme (listing, VDP, landing pages)
        sand: {
          DEFAULT: '#F3EBDD', // page background
          200: '#E8DCC5',     // borders/dividers on sand + ivory
          300: '#D9C7A6',
        },
        ivory: '#FFFDF8',     // cards and raised surfaces
        line: '#E5DACB',      // VDP dividers and panel outlines
        champagne: '#B89A66', // decorative accents only; too light for small text on sand/ivory
        ink: {
          DEFAULT: '#14243B', // primary text on sand/ivory
          muted: '#52647A',   // supporting text (5.9:1 on ivory)
        },
        navy: {
          50:  '#EEF2F7',
          100: '#DCE4EE',
          200: '#B7C6D8',
          DEFAULT: '#16324F', // primary buttons, links, accents
          800: '#0F2439',     // hover
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
        },
      },
      screens: {
        // VDP two-column breakpoint (gallery 2/3, contact panel 1/3)
        desk: '1200px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // Short editorial headings on the VDP only ("A closer look"); loaded via lib/fonts
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      borderRadius: {
        panel: '16px',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #111a50 0%, #1a2a80 40%, #1f3ee8 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)',
      },
      boxShadow: {
        'glow': '0 0 24px rgba(33, 62, 232, 0.25)',
        'glow-accent': '0 0 24px rgba(249, 115, 22, 0.3)',
        'card-hover': '0 20px 40px rgba(0,0,0,0.12)',
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
