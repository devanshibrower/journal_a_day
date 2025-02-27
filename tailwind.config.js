const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function({ addBase }) {
      addBase({
        'html': { backgroundColor: '#fafafa' },
        'body': { backgroundColor: '#fafafa' },
      })
    })
  ],
}

