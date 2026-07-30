import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'rgb(15 15 20 / <alpha-value>)',
          raised: 'rgb(24 24 30 / <alpha-value>)',
        },
        accent: {
          DEFAULT: '#7c6cff',
        },
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
} satisfies Config;
