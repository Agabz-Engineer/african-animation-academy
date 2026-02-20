import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6C3AE8",
          light: "#8B5CF6",
          dark: "#4C1D95",
        },
        accent: {
          DEFAULT: "#00D4AA",
          light: "#34EAC4",
          dark: "#009E7F",
        },
        bg: {
          DEFAULT: "#0D0D1A",
          surface: "#1A1A2E",
          card: "#16213E",
        },
        border: {
          DEFAULT: "#2A2A4A",
          light: "#D0C7F8",
        },
        text: {
          DEFAULT: "#F0EEFF",
          muted: "#9090B0",
          dim: "#5A5A80",
        },
        alert: "#FF6B6B",
        warning: "#FF9F43",
        success: "#00D4AA",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        hero: ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        display: ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.15" }],
        heading: ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.25" }],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #6C3AE8 0%, #00D4AA 100%)",
        "gradient-dark": "linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(108,58,232,0.15) 0%, rgba(0,212,170,0.05) 100%)",
        "gradient-glow": "radial-gradient(ellipse at center, rgba(108,58,232,0.3) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(108, 58, 232, 0.4)",
        "glow-sm": "0 0 10px rgba(108, 58, 232, 0.3)",
        "glow-accent": "0 0 20px rgba(0, 212, 170, 0.4)",
        card: "0 8px 32px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 16px 48px rgba(108, 58, 232, 0.25)",
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
      backdropBlur: {
        glass: "12px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(108, 58, 232, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(108, 58, 232, 0.7)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;