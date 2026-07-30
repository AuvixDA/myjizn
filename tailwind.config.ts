import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#08080c',
          raised: '#131318',
        },
        accent: {
          DEFAULT: '#7c6cff',
          soft: '#a78bfa',
          dim: '#5b4fd6',
        },
      },
      backdropBlur: {
        glass: '24px',
      },
      boxShadow: {
        glass: '0 1px 0 0 rgb(255 255 255 / 0.06) inset, 0 8px 30px -8px rgb(0 0 0 / 0.5)',
        'glow-accent': '0 0 0 1px rgb(124 108 255 / 0.4), 0 0 24px -4px rgb(124 108 255 / 0.55)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
