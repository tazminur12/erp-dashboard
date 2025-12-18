/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Kalpurush', 'Google Sans', 'sans-serif'],
        'english': ['Google Sans', 'sans-serif'],
        'bengali': ['Kalpurush', 'Noto Sans Bengali', 'SolaimanLipi', 'Bangla', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Add browser compatibility settings
  future: {
    hoverOnlyWhenSupported: true,
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
}
