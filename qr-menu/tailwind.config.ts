import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        accentText: 'var(--accentText)',
        primary: 'var(--primary)',
        primaryHover: 'var(--primary-hover)',
        primaryActive: 'var(--primary-active)',
        primaryText: 'var(--primary-text)',
        primaryDisabled: 'var(--primary-disabled)',
        primaryTextDisabled: 'var(--primary-text-disabled)',
        interactiveSoft: 'var(--interactive-soft)',
        interactiveSoftHover: 'var(--interactive-soft-hover)',
        interactiveSoftActive: 'var(--interactive-soft-active)',
        tabbar: 'var(--tabbar-bg)',
        inputBg: 'var(--input-bg)',
        inputBorder: 'var(--input-border)',
        inputBorderHover: 'var(--input-border-hover)',
        inputBorderFocus: 'var(--input-border-focus)',
        cardBg: 'var(--card-bg)',
        cardBorder: 'var(--card-border)',
        priceBadgeBg: 'var(--price-badge-bg)',
        priceBadgeBorder: 'var(--price-badge-border)',
        priceBadgeText: 'var(--price-badge-text)'
      },
      boxShadow: {
        soft: 'var(--shadow-sm)',
        elevate: 'var(--shadow-md)'
      },
      borderRadius: {
        xl: 'var(--r-xl)',
        '2xl': 'var(--r-2xl)',
        '3xl': 'var(--r-3xl)'
      },
      transitionTimingFunction: {
        calm: 'ease-out',
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      transitionDuration: {
        calm: '320ms',
        premium: '360ms'
      },
      fontFamily: {
        sans: ['var(--font-family)', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        heading: ['var(--font-heading)', 'Playfair Display', 'serif']
      },
      fontSize: {
        sm: ['0.92rem', { lineHeight: '1.6' }],
        base: ['1rem', { lineHeight: '1.7' }],
        lg: ['1.1rem', { lineHeight: '1.7' }],
        xl: ['1.25rem', { lineHeight: '1.45' }],
        '2xl': ['1.75rem', { lineHeight: '1.3' }]
      }
    }
  },
  plugins: []
} satisfies Config;
