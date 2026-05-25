import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0eeff',
          100: '#e0ddff',
          200: '#c9c4f7',
          500: '#6c63ff',
          600: '#5a52e0',
          700: '#4740b8',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
