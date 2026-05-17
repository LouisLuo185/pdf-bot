import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f6f3ee",
        foreground: "#1e1c1a",
        accent: "#c96442",
        accentSoft: "#f2d6c8",
        panel: "#fffdf9",
        border: "#dfd6c9"
      },
      boxShadow: {
        panel: "0 20px 40px rgba(33, 24, 16, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
