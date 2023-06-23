module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
      },
      colors: {
        "custom-red": {
          bg: "#e74c3c",
          hover: "",
        },
        "custom-green": {
          bg: "#9163e8",
          hover: "",
        },
        "custom-gray": {
          bg: "#343A40",
          hover: "",
        },
      },
    },
  },
  plugins: [],
};
