/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. Keep your custom font
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      // 2. Add your new color palette
      colors: {
        // 'crimson': '#DC143C',     // The main accent color
        // 'dark-card': '#1a1a1a',  // A very dark gray for cards
        // 'dark-border': '#333333' // A subtle border color
      }
    },
  },
  plugins: [],
}