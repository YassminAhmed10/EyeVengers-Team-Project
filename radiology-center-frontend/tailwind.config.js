/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0068b3',
        ink: '#17324a',
      },
      boxShadow: {
        panel: '0 12px 30px rgba(23, 50, 74, 0.08)',
      },
    },
  },
  plugins: [],
}
