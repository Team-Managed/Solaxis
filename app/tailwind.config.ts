import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--foreground))",
          border: "hsl(var(--card-border))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--card-border))",
        obsidian: {
          DEFAULT: "#07090e",
          950: "#05060a",
          900: "#07090e",
          800: "#0b0f17",
        },
        graphite: {
          DEFAULT: "#0f131c",
          900: "#0f131c",
          800: "#141a26",
          700: "#1b2333",
        },
        solar: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        neon: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        cyber: {
          crimson: "#ef4444",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "Geist Mono", "monospace"],
      },
      animation: {
        "pulse-radar": "radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "glow-amber": "glow-amber-pulse 2.5s ease-in-out infinite alternate",
        "glow-emerald": "glow-emerald-pulse 2.5s ease-in-out infinite alternate",
        "shimmer": "shimmer-slide 2s linear infinite",
      },
      keyframes: {
        "radar-ping": {
          "75%, 100%": {
            transform: "scale(2.4)",
            opacity: "0",
          },
        },
        "glow-amber-pulse": {
          "0%": { boxShadow: "0 0 12px -2px rgba(245, 158, 11, 0.25)" },
          "100%": { boxShadow: "0 0 24px 3px rgba(245, 158, 11, 0.55)" },
        },
        "glow-emerald-pulse": {
          "0%": { boxShadow: "0 0 12px -2px rgba(16, 185, 129, 0.25)" },
          "100%": { boxShadow: "0 0 24px 3px rgba(16, 185, 129, 0.55)" },
        },
        "shimmer-slide": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
