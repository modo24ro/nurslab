/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#102B46',
          'navy-dark': '#0B1E32',
          'navy-light': '#1C4269',
          green: '#116448',
          'green-dark': '#0D4E38',
          'green-light': '#E8F5EF',
          'green-mint': '#EBF5F0',
          red: '#DA2031',
          coral: '#FF7F6E',
          'coral-light': '#FFF0ED',
          sand: '#FBFBFA',
          slate: '#F4F7F6',
          sky: '#F0F7FB',
          border: '#E2E8F0'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Lora', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      boxShadow: {
        card: '0 2px 12px -2px rgba(16, 43, 70, 0.06), 0 1px 3px rgba(16, 43, 70, 0.04)',
        'card-hover': '0 12px 28px -6px rgba(16, 43, 70, 0.12), 0 4px 10px rgba(16, 43, 70, 0.06)',
      }
    },
  },
  plugins: [],
}
