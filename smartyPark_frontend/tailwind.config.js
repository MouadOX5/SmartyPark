/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006241',
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#006241',
          600: '#005236',
          700: '#00422B',
          800: '#003322',
          900: '#002418',
        },
        brand: {
          green: '#006241',
          lightGreen: '#E8F5E9',
          accent: '#10B981',
          orange: '#F59E0B',
          red: '#EF4444',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          textDark: '#0F172A',
          textMuted: '#64748B',
          border: '#E2E8F0',
        },
      },
    },
  },
  plugins: [],
}
