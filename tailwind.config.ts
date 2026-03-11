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
          DEFAULT: "#FF6D1F",
          light: "#FF8A4D",
          dark: "#E04D00",
        },
        accent: {
          DEFAULT: "#F5E7C6",
          light: "#FAF3E1",
          dark: "#DCCFB7",
        },
        bg: {
          DEFAULT: "#222222",
          surface: "#2C2C2C",
          card: "#333333",
        },
        border: {
          DEFAULT: "#444444",
          light: "#DCCFB7",
        },
        text: {
          DEFAULT: "#FAF3E1",
          muted: "#D2C9B8",
          dim: "#9E9688",
        },
        alert: "#FF5722",
        warning: "#FF9800",
        success: "#4CAF50",
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
        "gradient-primary": "linear-gradient(135deg, #FF6D1F 0%, #F5E7C6 100%)",
        "gradient-dark": "linear-gradient(135deg, #222222 0%, #2C2C2C 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(255,109,31,0.15) 0%, rgba(245,231,198,0.05) 100%)",
        "gradient-glow": "radial-gradient(ellipse at center, rgba(255,109,31,0.3) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 109, 31, 0.4)",
        "glow-sm": "0 0 10px rgba(255, 109, 31, 0.3)",
        "glow-accent": "0 0 20px rgba(245, 231, 198, 0.4)",
        card: "0 8px 32px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 16px 48px rgba(255, 109, 31, 0.25)",
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
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 109, 31, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 109, 31, 0.7)" },
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

