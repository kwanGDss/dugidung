import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0E1324",
        "bg-2": "#151B30",
        ink: "#F4E9CE",
        muted: "#7A8099",
        line: "#232A42",
        accent: "#D4B678",
        "accent-dim": "#8A7748",
      },
      fontFamily: {
        serif: ['"Nanum Myeongjo"', '"Noto Serif KR"', "serif"],
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(0.85)", opacity: "0.4" },
          "50%":      { transform: "scale(1.05)", opacity: "1" },
        },
      },
      animation: {
        breathe: "breathe 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
