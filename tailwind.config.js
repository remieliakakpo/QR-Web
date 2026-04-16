/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        danger: '#D21034',  // Rouge SafeLife
        primary: '#006B3F', // Vert Togo
        yellowLogo: '#FCD116', // Jaune Togo
      }
    },
  },
  plugins: [],
}