/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8b5cf6"
      },
      borderRadius: {
        "3xl": "1.75rem"
      },
      boxShadow: {
        "glow-primary": "0 0 40px rgba(139, 92, 246, 0.35)"
      },
      backgroundImage: {
        "truthlens-gradient":
          "linear-gradient(135deg, #0f0c29 0%, #1a1235 40%, #090016 100%)"
      }
    }
  },
  plugins: []
};
