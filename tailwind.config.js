/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        still: {
          bgTop: '#6C52A3',
          bgMid: '#352B5C',
          bgDeep: '#151833',
          bgBase: '#0B0E24',
          lavender: '#A58BF8',
          'lavender-light': '#EDE6FF',
          'lavender-dark': '#7A5CC7',
          cardDark: '#161B3B',
          cardDarkBorder: 'rgba(255, 255, 255, 0.09)',
          textMuted: '#9FA6CC',
        },
        taskati: {
          bg: '#F4F6FC',
          card: '#FFFFFF',
          border: '#E8ECF5',
          navy: '#1C1E38',
          text: '#222543',
          muted: '#8E98B0',
          blue: '#5051F9',
          'blue-light': '#EEF0FF',
          pink: '#E84E89',
          purple: '#744BE4',
        }
      },
      boxShadow: {
        'still-glow': '0 0 30px rgba(165, 139, 248, 0.25)',
        'still-card': '0 10px 30px -5px rgba(0, 0, 0, 0.35)',
        'still-white': '0 12px 35px -6px rgba(40, 20, 80, 0.18)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      }
    },
  },
  plugins: [],
};
