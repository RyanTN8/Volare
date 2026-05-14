/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#38aaf5',
          500: '#0e8fe6',
          600: '#0270c4',
          700: '#0358a0',
          800: '#074b84',
          900: '#0c3f6e',
          950: '#082848',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
