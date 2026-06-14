import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Inspiracja: ciemne tło + żółte akcenty (Behance / „Buk” + „Sunflower Fields”) */
        background: "#090C11",
        surface: "#202020",
        card: "#262B32",
        "card-muted": "#333533",
        border: "rgba(117, 123, 129, 0.32)",
        accent: "#FFEE32",
        "accent-warm": "#FFD100",
        muted: "#757B81",
        "muted-bright": "#D6D6D6",
        foreground: "#FFFFFF",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["var(--font-noto-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-noto-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 28px rgba(255, 238, 50, 0.22)",
        "glow-sm": "0 0 14px rgba(255, 209, 0, 0.18)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "save-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out forwards",
        shimmer: "shimmer 1.2s ease-in-out infinite",
        "save-pop": "save-pop 0.45s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
