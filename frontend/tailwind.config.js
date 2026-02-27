/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          border: "var(--sidebar-border)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          muted: "var(--sidebar-muted)",
        },
        purple: {
          50: "oklch(0.97 0.03 285)",
          100: "oklch(0.93 0.06 285)",
          200: "oklch(0.85 0.10 285)",
          300: "oklch(0.75 0.15 285)",
          400: "oklch(0.65 0.19 285)",
          500: "oklch(0.58 0.22 285)",
          600: "oklch(0.50 0.22 285)",
          700: "oklch(0.42 0.20 285)",
          800: "oklch(0.32 0.15 285)",
          900: "oklch(0.22 0.10 285)",
          950: "oklch(0.14 0.06 285)",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 24px oklch(0.08 0.04 285 / 0.6), 0 1px 4px oklch(0.08 0.04 285 / 0.4)",
        "card-hover": "0 8px 32px oklch(0.08 0.04 285 / 0.7), 0 2px 8px oklch(0.08 0.04 285 / 0.5)",
        glow: "0 0 20px oklch(0.58 0.22 285 / 0.4)",
        "glow-sm": "0 0 10px oklch(0.58 0.22 285 / 0.3)",
        "inner-glow": "inset 0 1px 0 oklch(1 0 0 / 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px oklch(0.58 0.22 285 / 0.3)" },
          "50%": { boxShadow: "0 0 20px oklch(0.58 0.22 285 / 0.6)" },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/container-queries"),
  ],
};
