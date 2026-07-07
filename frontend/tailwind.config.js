/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FBEAF2',
          200: '#F0B8D3',
          400: '#DC6BA8',
          600: '#C13584',
          900: '#611A42',
        },
        accent: {
          50:  '#EEEDFC',
          200: '#C7C3F2',
          400: '#8B83E3',
          600: '#5851DB',
          900: '#2C296E',
        },
        success: {
          50:  '#E8F7ED',
          200: '#A3E0B8',
          400: '#4CC178',
          600: '#2C9A54',
          900: '#164D2A',
        },
        warning: {
          50:  '#FDF3DF',
          200: '#F5D48A',
          400: '#EBA83E',
          600: '#C4841E',
          900: '#62420F',
        },
        danger: {
          50:  '#FCEAEA',
          200: '#F0A8A8',
          400: '#E06565',
          600: '#C13333',
          900: '#611919',
        },
        neutral: {
          50:  '#FAFAFA',
          200: '#E0E0E0',
          400: '#A8A8A8',
          600: '#6E6E6E',
          900: '#262626',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)', '-apple-system', 'sans-serif'],
        ui:      ['var(--font-ui)', '-apple-system', 'sans-serif'],
        badge:   ['var(--font-badge)', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}