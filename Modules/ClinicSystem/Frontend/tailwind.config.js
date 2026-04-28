/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#0ea5e9',
        primary: '#ffffff',
        secondary: '#f0f9ff',
        accent: '#06b6d4',
        neutral: '#f3f4f6',
        text: '#1f2937',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}