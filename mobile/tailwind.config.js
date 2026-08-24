/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#FFFFFF',
        surface: '#F4F7FA',
        border: '#DCE6EF',
        blueTint: '#E3EEF9',
        secondary: '#1F5C96',
        ink: '#17242E',
        danger: '#EF5350',
        muted: '#6B7280',
      }
    },
  },
  plugins: [],
}
