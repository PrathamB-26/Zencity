/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          dark: '#1b4332',
          DEFAULT: '#2d6a4f',
          accent: '#40916c',
          light: '#52b788',
          soft: '#74c69d',
          pale: '#d8f3dc',
          surface: '#f8faf9',
          border: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
