/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sentri: {
          primary: '#0f766e', dark: '#0c4a3e', accent: '#f59e0b',
          critical: '#dc2626', high: '#ea580c', medium: '#f59e0b', low: '#22c55e',
          bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
};
