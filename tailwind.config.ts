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
        ink: "#171A21",
        muted: "#5C6470",
        line: "#B9A7DE",
        paper: "#F6F5F8",
        civic: "#4A2E7F",
        lilac: "#B9A7DE",
        lilacLight: "#E2E0EA",
        success: "#16704F",
        accent: "#8A5600",
        danger: "#9E2621"
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
        serif: ["Spectral", "Georgia", "Times New Roman", "serif"],
        mono: ["IBM Plex Mono", "SF Mono", "Consolas", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
