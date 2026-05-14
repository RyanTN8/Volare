/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Pastel purple / lavender palette.
        brand: {
          50:  '#f7f4fe',
          100: '#efe9fd',
          200: '#ddd4fb',
          300: '#c4b3f6',
          400: '#a888ef',
          500: '#8f63e4',
          600: '#7c45d6',
          700: '#6a36bb',
          800: '#592f99',
          900: '#4a297c',
          950: '#2e1854',
        },
        accent: {
          400: '#d2a8ef',
          500: '#c08ae6',
          600: '#a86cd2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'shimmer-down': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer-down': 'shimmer-down 1.5s linear infinite',
      },
    },
  },
  plugins: [],
}
