// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: '#26abff',
        secondary: '#121a24',
      },
      keyframes: {
        loadingCircle: {
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'loading': 'loadingCircle 1s infinite linear',
      },
    },
  },
  plugins: [],
}