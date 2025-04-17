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
      
      // Custom font sizes with specified line height and letter spacing
      fontSize: {
        'display-large': ['40px', {
          lineHeight: '1.5',
          letterSpacing: '-0.019em',
          fontWeight: '700',
        }],
        'display-medium': ['32px', {
          lineHeight: '1.5',
          letterSpacing: '-0.019em',
          fontWeight: '600',
        }],
        'text-body': ['24px', {
          lineHeight: '1.5',
          letterSpacing: '-0.019em',
          fontWeight: '400',
        }],
        'text-nav': ['20px', {
          lineHeight: '1.5',
          letterSpacing: '-0.019em',
          fontWeight: '700',
        }],
      },
    },
  },
  plugins: [],
} 