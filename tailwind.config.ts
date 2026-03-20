import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E1A22",
        sand: "#F4EFE7",
        mist: "#DDE8E4",
        ember: "#D96C3F",
        clay: "#B84D24",
        pine: "#0F5D5E",
        tide: "#357C82",
        gold: "#CBA25F",
        slate: "#5D6A73"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(2, 6, 23, 0.36)",
        glow: "0 24px 80px rgba(14, 26, 34, 0.14)",
        card: "0 18px 56px rgba(14, 26, 34, 0.10)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        "mesh-gradient": "radial-gradient(circle at top, rgba(110, 231, 249, 0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(34, 211, 238, 0.12), transparent 26%), linear-gradient(180deg, #07111f 0%, #020617 100%)",
        "hero-grid": "radial-gradient(circle at top, rgba(217, 108, 63, 0.16), transparent 36%), radial-gradient(circle at 20% 20%, rgba(53, 124, 130, 0.16), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.62), rgba(255,255,255,0.18))"
      },
      animation: {
        "fade-up": "fadeUp 700ms ease forwards",
        "pulse-soft": "pulseSoft 2.8s ease-in-out infinite"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(0.985)", opacity: "0.92" }
        }
      }
    }
  },
  plugins: []
};

export default config;
