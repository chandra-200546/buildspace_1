/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#09090b",
        panel: "#111115",
        border: "#1f1f24",
        text: "#f4f4f5",
        muted: "#9ca3af",
        accent: "#22d3ee",
        success: "#34d399",
        warning: "#f59e0b"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.35), 0 20px 40px rgba(0,0,0,0.35)"
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "'Segoe UI'", "sans-serif"]
      }
    }
  },
  plugins: []
};
