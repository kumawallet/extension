module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins ", "sans-serif"],
        inter: ["Inter Variable", "sans-serif"],
        quicksand: ["Quicksand Variable", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
      },
      backgroundImage: {
        linear: "linear-gradient(90deg, #3F2966 3.21%, #7C4DC4 100%)",
      },
      colors: {
        primary: {
          default: "#7C4DC4",
        },
        "custom-red": {
          bg: "#e74c3c",
          hover: "",
        },
        "custom-green": {
          bg: "#986bff",
          hover: "",
        },
        "custom-gray": {
          bg: "#343A40",
          hover: "",
        },
      },
    },
  },
};
