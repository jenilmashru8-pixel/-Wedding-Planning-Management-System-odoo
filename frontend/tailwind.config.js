/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fbf5f6',
          100: '#f6ebec',
          200: '#edd6d8',
          300: '#dfb7ba',
          400: '#c9898e',
          500: '#ad5f66',
          600: '#94474f',
          700: '#722F37', // Brand Royal Burgundy
          800: '#642930',
          900: '#53252a',
          950: '#321215',
        },
        gold: {
          50: '#faf7f0',
          100: '#f4ede0',
          200: '#e8d9c0',
          300: '#d9be97',
          400: '#C5A46D', // Brand Champagne Gold
          500: '#b48f57',
          600: '#9b7445',
          700: '#7d5937',
          800: '#664931',
          900: '#543c2b',
          950: '#2f1f15',
        },
        ivory: {
          DEFAULT: '#FAF8F3',
          50: '#FFFFFF',
          100: '#FAF8F3',
          200: '#F5F0E6',
          300: '#EDE4D1',
        },
        charcoal: {
          DEFAULT: '#292929',
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#292929', // Brand Charcoal
          950: '#1a1a1a',
        },
        surface: '#F1F1EF',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -5px rgba(114, 47, 55, 0.08), 0 4px 6px -2px rgba(197, 164, 109, 0.05)',
        'luxury-lg': '0 20px 40px -10px rgba(114, 47, 55, 0.12), 0 8px 12px -4px rgba(197, 164, 109, 0.08)',
        'gold-glow': '0 0 20px rgba(197, 164, 109, 0.35)',
      },
    },
  },
  plugins: [],
}
