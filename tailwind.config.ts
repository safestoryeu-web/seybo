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
        fairy: {
          sky: "#e0e7ff",
          dusk: "#c7d2fe",
          lavender: "#a5b4fc",
          violet: "#818cf8",
          purple: "#6366f1",
          night: "#4f46e5",
          deep: "#3730a3",
          star: "#fef3c7",
        },
      },
      fontFamily: {
        story: ["var(--font-story)", "Georgia", "serif"],
      },
      animation: {
        twinkle: "twinkle 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      borderRadius: {
        "fairy-xl": "2rem",
        "fairy-2xl": "2.5rem",
        "fairy-3xl": "3rem",
      },
      boxShadow: {
        fairy: "0 25px 50px -12px rgba(99, 102, 241, 0.15)",
        "fairy-glow": "0 0 40px rgba(129, 140, 248, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
