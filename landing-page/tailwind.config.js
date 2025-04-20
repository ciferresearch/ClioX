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
      
      // Custom typography styles
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#000000CC',
            h1: {
              fontWeight: '700',
            },
            h2: {
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: '#282939',
            },
            h3: {
              fontWeight: '600',
              color: '#282939',
            },
            ul: {
              margin: '1.5rem 0',
            },
            'ul > li': {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            a: {
              color: '#282939',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            blockquote: {
              fontWeight: '400',
              fontStyle: 'italic',
              color: '#282939',
              borderLeftColor: '#282939',
              borderLeftWidth: '0.25rem',
              paddingLeft: '1rem',
            },
            'ol > li::marker': {
              color: '#282939',
              fontWeight: '400',
            },
            'ul > li::marker': {
              color: '#282939',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 