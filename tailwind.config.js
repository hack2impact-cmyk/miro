/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'miro-base': '#FCFBF9',
        'miro-sidebar': '#F9F8F6',
        'miro-accent': '#FEECE9',
        'miro-accent-dark': '#F87171',
        'miro-green': '#A3B8A2',
        'miro-green-dark': '#6E8B6D',
        'miro-text': '#1F2937', // Dark charcoal for better readability
        'miro-text-light': '#6B7280', // Softer gray for secondary text
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideInUp: 'slideInUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}