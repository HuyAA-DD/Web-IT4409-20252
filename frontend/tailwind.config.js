/** @type {import('tailwindcss').Config} */
import formsPlugin from '@tailwindcss/forms';
import containerQueriesPlugin from '@tailwindcss/container-queries';

export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {}, // Đã xóa toàn bộ custom colors, spacing, fonts...
  },
  plugins: [
    formsPlugin,
    containerQueriesPlugin
  ],
};