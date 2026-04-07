import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}", "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "custom-color1": "#764BA2",
        "custom-color2": "#667EEA",
        "custom-color3": "#10182F",
        "custom-color4": "#ffd4c2",
        "custom-color5": "#F7F2FC",
        "logo-color": "#fb6050",
        "logo-color-lighter": "#ffe7e2",
      },
      screens: {
        mobile: "320px",
        tablet: "480px",
        laptop: "770px",
        "laptop-l": "1024px",
        "laptop-xl": "1200px",
        "laptop-2xl": "1400px",
        "laptop-3xl": "1600px",
      },
      boxShadow: {
        input: "0px 0px 5px 0px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui(), require("tailwindcss-animate")],
};
export default config;
