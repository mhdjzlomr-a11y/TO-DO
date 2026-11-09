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
        taskati: {
          bg: '#F4F6FC',
          card: '#FFFFFF',
          border: '#E8ECF5',
          navy: '#1C1E38',
          text: '#222543',
          muted: '#8E98B0',
          blue: '#5051F9',
          'blue-light': '#EEF0FF',
          'blue-hover': '#4344E0',
          pink: '#E84E89',
          'pink-light': '#FEEBF2',
          purple: '#744BE4',
          'purple-light': '#F4EFFF',
          cyan: '#36B9CC',
          teal: '#20C997',
          amber: '#F6C23E',
        }
      },
      boxShadow: {
        'taskati': '0 8px 30px -4px rgba(80, 81, 249, 0.08)',
        'taskati-card': '0 2px 16px rgba(34, 37, 67, 0.04)',
        'taskati-float': '0 12px 35px -6px rgba(80, 81, 249, 0.25)',
        'taskati-pink': '0 12px 35px -6px rgba(232, 78, 137, 0.25)',
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
};
