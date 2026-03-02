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
        calm: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
      },
      transitionDuration: {
        calm: '180ms'
      },
      fontFamily: {
        sans: ['var(--font-family)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      fontSize: {
        sm: ['0.92rem', { lineHeight: '1.6' }],
        base: ['1rem', { lineHeight: '1.75' }],
        lg: ['1.1rem', { lineHeight: '1.75' }],
        xl: ['1.25rem', { lineHeight: '1.6' }],
        '2xl': ['1.5rem', { lineHeight: '1.5' }]
      }
    }
  },
  plugins: []
} satisfies Config;
