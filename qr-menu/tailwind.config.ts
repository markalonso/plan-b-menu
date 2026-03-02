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
        accentText: 'var(--accentText)'
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
        calm: 'ease'
      },
      transitionDuration: {
        calm: '300ms'
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
