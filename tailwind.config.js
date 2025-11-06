/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fire: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        focus: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'flame': 'flame 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px rgba(249, 115, 22, 0.5), 0 0 20px rgba(249, 115, 22, 0.3)',
          },
          '100%': { 
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.8), 0 0 40px rgba(249, 115, 22, 0.5)',
          },
        },
        flame: {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)',
            opacity: '1',
          },
          '50%': { 
            transform: 'translateY(-5px) scale(1.05)',
            opacity: '0.8',
          },
        },
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'fire-gradient': 'linear-gradient(135deg, #f97316, #ea580c, #c2410c)',
        'focus-gradient': 'linear-gradient(135deg, #06b6d4, #0891b2, #0e7490)',
      },
    },
  },
  plugins: [],
}
