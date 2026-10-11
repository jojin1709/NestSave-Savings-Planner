import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eaf5f0",
          100: "#d5ebd8",
          200: "#add7b2",
          300: "#7fb787",
          400: "#48925b",
          500: "#0d684c",
          600: "#0a563e",
          700: "#084431",
          800: "#063325",
          900: "#042219",
        },
        dark: {
          bg: "#000000",
          surface: "#121212",
          elevated: "#18181b",
          border: "#27272a",
        }
      }
    }
  },
  plugins: []
};
export default config;