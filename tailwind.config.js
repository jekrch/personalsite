module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'jk-teal': 'var(--jk-teal)',
        'zinc': {
          850: '#1f1f23', 
          950: '#0c0c0e',
        }
      },
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-teal': 'pulse-teal 2s infinite',
      },
       keyframes: {
        'pulse-teal': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(91, 133, 146, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(91, 133, 146, 0)' },
        }
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};