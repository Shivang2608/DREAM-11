import tailwindcss from '@tailwindcss/postcss'; // <-- This is the fix
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss,
    autoprefixer,
  ],
}