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
    extend: {
      colors: {
        accent: "#ffffff",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "inherit",
            a: {
              color: "#3b82f6",
              "&:hover": {
                color: "#2563eb",
              },
            },
            code: {
              color: "inherit",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              backgroundColor: "hsl(var(--b2))",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              backgroundColor: "hsl(var(--b2))",
              padding: "1rem",
              borderRadius: "0.5rem",
              overflow: "auto",
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
  daisyui: {
    themes: ["light"],
  },
};
