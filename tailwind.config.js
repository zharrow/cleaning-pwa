/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0073e6',
          600: '#005bb3',
          700: '#004280',
          800: '#002a4d',
          900: '#00121a',
        },
        success: {
          50: '#e6f9f0',
          100: '#b3ecd4',
          200: '#80dfb8',
          300: '#4dd29c',
          400: '#1ac580',
          500: '#00b864',
          600: '#009350',
          700: '#006e3c',
          800: '#004928',
          900: '#002414',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Important pour Taiga UI
  },
}