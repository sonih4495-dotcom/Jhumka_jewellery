import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* ── Oxidised Jewellery Brand Palette ── */
        oxidised: {
          50:  '#f5f3f0',
          100: '#e8e2d8',
          200: '#d0c5b2',
          300: '#b3a38a',
          400: '#978469',
          500: '#7a6850',
          600: '#5c4d3a',
          700: '#3f342a',
          800: '#2a221b',
          900: '#1a140f',
          950: '#0d0a07',
        },
        gold: {
          50:  '#fbf8ed',
          100: '#f5eece',
          200: '#eddca1',
          300: '#e3c46d',
          400: '#d9ad40',
          500: '#c59527',
          600: '#a6751c',
          700: '#815418',
          800: '#6b431a',
          900: '#5c391a',
          DEFAULT: '#D4AF37',
        },
        jewel: {
          rani: '#BE185D',
          emerald: '#047857',
          amber: '#D97706',
          amethyst: '#7C3AED',
        },
        boutique: {
          ivory: '#FAF8F5',
          cream: '#F4EFEA',
          charcoal: '#181716',
          obsidian: '#11100F',
          silver: '#E2E8F0',
          muted: '#78716C',
        },
        antique: {
          DEFAULT: '#8A8A7A',
          light:   '#b8b8a5',
          dark:    '#5c5c50',
        },
        rani: {
          DEFAULT: '#C2185B',
          light:   '#e91e8c',
          dark:    '#880e4f',
        },
        mustard: {
          DEFAULT: '#C9940A',
          light:   '#F0B429',
          dark:    '#926B04',
        },
        maroon: {
          DEFAULT: '#7D1A1A',
          light:   '#A52828',
          dark:    '#4E0F0F',
        },
        cream: {
          DEFAULT: '#F8F3EC',
          dark:    '#EDE3D5',
          darker:  '#E0D3C0',
        },
        parchment: {
          DEFAULT: '#F2EBE0',
          dark:    '#E8DCCF',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'grain-shift': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%':      { transform: 'translate(-1%, -1%)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%':   { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.3s ease-out',
        'fade-out':       'fade-out 0.2s ease-out',
        'slide-in':       'slide-in 0.3s ease-out',
        'slide-out':      'slide-out 0.3s ease-out',
        shimmer:          'shimmer 2.2s linear infinite',
        'grain-shift':    'grain-shift 8s ease-in-out infinite',
        marquee:          'marquee 32s linear infinite',
        'marquee-slow':   'marquee 45s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
