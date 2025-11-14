/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crimson': '#DC143C',
        'dark-card': '#2C2C2E',
        'dark-border': '#444446',
      }
    },
  },
  plugins: [],
}