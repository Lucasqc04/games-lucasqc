/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#ff6a00",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407"
        },
        ink: "#050505"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        orange: "0 18px 60px rgba(255, 106, 0, 0.18)",
        panel: "0 18px 70px rgba(0, 0, 0, 0.25)"
      },
      maxWidth: {
        reading: "72ch"
      }
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("light", ".light &");
    }),
  ],
};
