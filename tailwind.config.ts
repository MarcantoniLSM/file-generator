import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        line: "#D7DEE8",
        paper: "#F7F8FA",
        civic: "#0F766E",
        accent: "#B45309"
      }
    }
  },
  plugins: []
};

export default config;
