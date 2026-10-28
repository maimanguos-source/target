/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#0c0e12',
          surface: '#141820',
          elevated: '#1c212c',
          cream: '#f8f6f0',
          'cream-soft': '#ede9df',
          'cream-card': '#ffffff'
        },
        brand: {
          primary: '#0ea5e9',
          secondary: '#f43f5e',
          accent: '#10b981',
          gold: '#eab308',
          yellow: '#fde047',
          dark: '#0a0c10'
        },
        sticker: {
          cyan: '#06b6d4',
          pink: '#ec4899',
          purple: '#8b5cf6',
          lime: '#84cc16',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'sticker': '0 8px 0 0 rgba(0,0,0,0.9), 0 16px 30px rgba(0,0,0,0.3)',
        'sticker-sm': '0 4px 0 0 rgba(0,0,0,0.9)',
        'sticker-glow': '0 0 25px rgba(14, 165, 233, 0.35)',
        'card-3d': '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shine': 'shine 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        }
      }
    },
  },
  plugins: [],
}

