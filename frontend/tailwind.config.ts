import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        foundation: {
          50: '#f3fbf8',
          100: '#d7f3ea',
          500: '#168a6a',
          600: '#0f6f56',
          900: '#12372f',
        },
        ink: {
          50: '#f8fafc',
          100: '#e7edf2',
          500: '#627386',
          700: '#334155',
          900: '#111827',
        },
        support: {
          amber: '#b7791f',
          blue: '#2563eb',
          red: '#b91c1c',
        },
      },
      boxShadow: {
        focus: '0 0 0 3px rgba(22, 138, 106, 0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;

