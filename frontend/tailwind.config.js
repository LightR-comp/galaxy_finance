/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Exo 2'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        space: {
          950: "#05020f",
          900: "#0a0520",
          800: "#110a35",
          700: "#1a1050",
        },
        nebula: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        star: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        aurora: {
          400: "#34d399",
          500: "#10b981",
        },
        comet: {
          400: "#f472b6",
          500: "#ec4899",
        },
      },
      backgroundImage: {
        "galaxy-mesh":
          "radial-gradient(ellipse at 20% 30%, #3b1fa8 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, #1e1065 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #05020f 0%, #05020f 100%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "slide-up": "slideUp 0.4s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139,92,246,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(139,92,246,0.7)" },
        },
      },
    },
  },
  plugins: [],
};