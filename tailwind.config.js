module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        sm: "100%",
        md: "100%",
        lg: "1024px",
        xl: "1200px",
      },
    },
    fontFamily: {
      "sans": ["Montserrat", "sans-serif"],
    },
  },
  plugins: [require("daisyui")],
};
