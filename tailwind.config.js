/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        'mono-tech': ['Share Tech Mono', 'monospace'],
      },
      colors: {
        cyber: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          amber: '#ffaa00',
          red: '#ff3366',
          green: '#00ff88',
          dark: '#03070d'
        }
      }
    },
  },
  plugins: [],
}
