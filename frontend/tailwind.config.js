/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF6B00",
          "orange-light": "#FF8C38",
          "orange-dark": "#E55A00",
          "orange-glow": "#FF6B0033",
          // Dark theme
          black: "#0A0A0A",
          "black-soft": "#111111",
          "black-card": "#161616",
          "black-border": "#222222",
          gray: "#888888",
          "gray-light": "#AAAAAA",
          "gray-dark": "#444444",
        },
      },
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-orange": "pulseOrange 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseOrange: {
          "0%, 100%": { boxShadow: "0 0 0 0 #FF6B0055" },
          "50%": { boxShadow: "0 0 0 12px #FF6B0000" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        orange: "0 0 24px #FF6B0044",
        "orange-sm": "0 0 12px #FF6B0033",
        card: "0 4px 32px #00000066",
        "card-light": "0 4px 32px #00000018",
      },
    },
  },
  plugins: [],
};