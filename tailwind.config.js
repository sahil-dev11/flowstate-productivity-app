/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark backgrounds
        slate: {
          950: '#0B0D14',
          900: '#0F1117',
          800: '#151721',
          700: '#1C1F2E',
          600: '#242838',
          500: '#2D3148',
        },
        // Lime accent
        lime: {
          400: '#D4FF00',
          300: '#C8FF00',
          200: '#DEFF5A',
          glow: 'rgba(200,255,0,0.3)',
        },
        // Purple accent
        violet: {
          400: '#A78BFA',
          300: '#C4B5FD',
          glow: 'rgba(167,139,250,0.3)',
        },
        // Status
        emerald: { 400: '#34D399', 500: '#10B981' },
        rose: { 400: '#F87171', 500: '#EF4444' },
        amber: { 400: '#FBBF24' },
        sky: { 400: '#38BDF8' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.4), 0 16px 40px rgba(0,0,0,0.35)',
        'lime': '0 0 24px rgba(200,255,0,0.35)',
        'lime-sm': '0 0 10px rgba(200,255,0,0.2)',
        'violet': '0 0 20px rgba(167,139,250,0.3)',
      },
      backgroundImage: {
        'gradient-lime': 'linear-gradient(135deg, #C8FF00, #A8D800)',
        'gradient-violet': 'linear-gradient(135deg, #A78BFA, #818CF8)',
        'gradient-card': 'linear-gradient(135deg, #1C1F2E, #151721)',
      },
    },
  },
  plugins: [],
}
