import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#f5f0e8",
        cream: "#f5f0e8",
        muted: "#a09880",
        amber: "#d47c2f",
        "amber-hover": "#e08a35",
        charcoal: "#0a0a0a",
        "charcoal-light": "#141414",
        "charcoal-lighter": "#1e1e1e",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
