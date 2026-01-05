/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: '#ffffff',
        background: '#fafafa',
        border: '#e5e5e5',
        muted: '#737373',
        prob: {
          high: 'rgba(34, 197, 94, 0.25)',
          mid: 'rgba(250, 204, 21, 0.2)',
          low: 'rgba(239, 68, 68, 0.2)',
        },
      },
      spacing: {
        cell: '80px',
      },
    },
  },
  plugins: [],
}
