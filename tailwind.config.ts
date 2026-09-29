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
        obsidian: "#09090b",
        "tactical-emerald": "#10b981",
        "threat-crimson": "#ef4444",
        "dim-emerald": "#064e3b",
        "bright-emerald": "#34d399",
        "warn-amber": "#f59e0b",
        "zinc-900": "#18181b",
        "zinc-800": "#27272a",
        "zinc-700": "#3f3f46",
        "zinc-600": "#52525b",
        "zinc-400": "#a1a1aa",
        "zinc-300": "#d4d4d8",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        "scan-line": "scanLine 3s linear infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "flag-capture": "flagCapture 0.5s ease-out forwards",
        "type-in": "typeIn 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "blink": "blink 1s step-end infinite",
      },
      keyframes: {
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.6", boxShadow: "0 0 8px #10b981" },
          "50%": { opacity: "1", boxShadow: "0 0 24px #10b981, 0 0 48px #10b98155" },
        },
        flagCapture: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        typeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(16,185,129,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
