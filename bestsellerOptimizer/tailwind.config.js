// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      fontFamily: {
        sans: ['Roboto', 'sans-serif']
      },

      height:{
        '62':'15.5rem',
        '82': '20.5rem',
        '84': '21rem',
        '100': '25rem',
        '114': '28.5rem',
        '116': '29rem',
        '120': '30rem'
      },

      minHeight:{
        '120': '30rem'
      },

      maxHeight:{
        '18': '4.5rem',
        '80': '20rem'
      },

      width: {
        '25': '6.25rem',
        '80': '20rem',
        '100': '25rem',
        '120': '30rem',
        '150': '37.5rem',
        '160': '40rem',
        '200': '50rem'
      },

      minWidth:{
        '160': '40rem',
        '200': '50rem'
      },

      maxWidth: {
        '120': '30rem',
        '200': '50rem'
      },

      margin:{
        '25': '6.25rem',
        '26': '6.5rem'
      },

      inset:{
        '78': '19.5rem'
      },

      screens:{
        'fullBoxScreen': '50rem',
        'fullFeaturesScreen': '68rem'
      }

    },
  },
  plugins: [],
  }

