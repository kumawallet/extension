module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 20s linear infinite",
      },
      colors: {
        "custom-green": {
          bg: "#469999",
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
