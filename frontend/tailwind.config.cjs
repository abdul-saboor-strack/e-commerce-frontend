
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(2, 6, 23, 0.12)",
        glow: "0 0 0 1px rgba(148, 163, 184, 0.15), 0 18px 50px rgba(2, 6, 23, 0.45)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      screens: {
        'sm': '640px',  // Small devices (phones)
        'md': '768px',  // Medium devices (tablets)
        'lg': '1024px', // Large devices (laptops)
        'xl': '1280px', // Extra large screens (desktop)
      },
    },
  },
  plugins: [],
};
