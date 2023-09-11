/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
    screens:{
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
      midscreen: {'max': '767px'},
      maxscreen: {'max': '639px'},
      maxmobile: {'max': '580px'},
      mobile: {'max': '480px'},
      midmobile: {'max': '380px'},
      minmobile: {'max': '280px'}
    }
  },
  plugins: [
   
    // ...
  ],
}