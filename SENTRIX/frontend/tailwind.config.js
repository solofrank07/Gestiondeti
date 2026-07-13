/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        sentrix: {
          50: '#eef2f7',
          100: '#d8e2ff',
          200: '#afc6fb',
          300: '#8ba2d5',
          400: '#475e8c',
          500: '#1f3864',
          600: '#03224d',
          700: '#001a41',
          800: '#00102b',
          900: '#000814',
        },
        risk: {
          low: '#22c55e',
          medium: '#eab308',
          high: '#f97316',
          critical: '#ef4444',
        },
        alert: {
          DEFAULT: '#c55a11',
          light: '#f98139',
          subtle: '#FCE4D6',
        },
        safe: {
          DEFAULT: '#375623',
          subtle: '#E2EFDA',
        },
        surface: {
          DEFAULT: '#f7f9fc',
          card: '#ffffff',
          dim: '#d8dadd',
          blue: '#D9E2F3',
          container: '#eceef1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
        mono: ['monospace'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
