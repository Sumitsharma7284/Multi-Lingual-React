/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F9FA',
        surface: '#FFFFFF',
        mutedSurface: '#F1F3F5',
        hairline: '#DFE3E8',
        ink: {
          primary: '#181A1B',
          secondary: '#495057',
          muted: '#6C757D',
        },
        accent: {
          DEFAULT: '#B84A00',
          hover: '#9A3D00',
          tint: '#FDF6F0',
          border: '#F5D0B5',
        },
        status: {
          green: '#166534',
          greenTint: '#ECFDF5',
          greenBorder: '#A7F3D0',
          draft: '#854D0E',
          draftTint: '#FEFCE8',
          draftBorder: '#FEF08A',
        },
        // Institutional aliases mapping previous gov tokens cleanly to light palette
        gov: {
          navy: '#181A1B',
          navyDark: '#181A1B',
          navyMuted: '#495057',
          blue: '#2B4C6F',
          saffron: '#B84A00',
          saffronHover: '#9A3D00',
          saffronLight: '#FDF6F0',
          green: '#166534',
          greenLight: '#ECFDF5',
          gold: '#B84A00',
          surface: '#FFFFFF',
          bg: '#F8F9FA',
          border: '#DFE3E8',
          borderDark: '#CFD6DE',
          textMain: '#181A1B',
          textMuted: '#495057',
        }
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '"Noto Sans Devanagari"',
          '"Noto Sans Gurmukhi"',
          'system-ui',
          '-apple-system',
          'sans-serif'
        ],
        serif: [
          '"Plus Jakarta Sans"',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          '"JetBrains Mono"',
          'Menlo',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
        subtle: '0 1px 2px rgba(0, 0, 0, 0.04)',
        card: '0 1px 2px rgba(0, 0, 0, 0.04)',
        cardHover: '0 2px 4px rgba(0, 0, 0, 0.06)',
        dropdown: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        md: '6px',
      }
    },
  },
  plugins: [],
}
