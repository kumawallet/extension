module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    {
      pattern: /-chain-/,
      variants: ["after", "before", "hover", "selection"],
    },
    // {
    //   pattern: /bg-chain-/,
    // },
    // {
    //   pattern: /border-chain-/,
    // },
    // {
    //   pattern: /fill-chain-/,
    // },
  ],
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
          bg: "#469999",
          hover: "",
        },
        "custom-gray": {
          bg: "#343A40",
          hover: "",
        },
        chain: {
          "moonbase-alpha": {
            primary: "#54cbc8",
            secondary: "#fff",
            fill: "#54cbc8",
          },
          acala: {
            primary: "#e91a53",
            secondary: "#fff",
            fill: "#e91a53",
          },
          astar: {
            primary: "#007cf0",
            secondary: "#fff",
            fill: "#007cf0",
          },
          binance: {
            primary: "#f3ba2f",
            secondary: "#fff",
            fill: "#f3ba2f",
          },
          default: {
            primary: "#469999",
            secondary: "#fff",
            fill: "#469999",
          },
          ethereum: {
            primary: "#6975b0",
            secondary: "#fff",
            fill: "#6975b0",
          },
          goerli: {
            primary: "#6975b0",
            secondary: "#fff",
            fill: "#6975b0",
          },
          kusama: {
            primary: "#fff",
            secondary: "#cc046b",
            fill: "#000",
          },
          moonbeam: {
            primary: "#54cbc8",
            secondary: "#fff",
            fill: "#54cbc8",
          },
          moonriver: {
            primary: "#e7af08",
            secondary: "#fff",
            fill: "#e7af08",
          },
          polkadot: {
            primary: "#d3046f",
            secondary: "#fff",
            fill: "#d3046f",
          },
          polygon: {
            primary: "#7c43da",
            secondary: "#fff",
            fill: "#7c43da",
          },
          shibuya: {
            primary: "#ec442d",
            secondary: "#fff",
            fill: "#ec442d",
          },
          shiden: {
            primary: "#5630c3",
            secondary: "#fff",
            fill: "#5630c3",
          },
        },
      },
    },
  },
  plugins: [],
};
