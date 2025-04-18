/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom colors
      colors: {
        primary: {
          DEFAULT: '#282939', // Primary CTA background
        },
        secondary: {
          DEFAULT: '#F2F2F2', // Secondary CTA background
        },
        text: {
          primary: '#FFFFFF', // Primary CTA text
          secondary: '#282939', // Secondary CTA text
          DEFAULT: '#000000CC', // Default text color with 80% opacity
        },
      },
      
      // Custom font families
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        serif: ['Libre Baskerville', 'serif'],
      },
      
      // We've removed the unused custom font sizes since we're using Tailwind's defaults
    },
  },
  plugins: [],
} 