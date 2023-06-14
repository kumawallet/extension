module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    {
      pattern: /-chain-/,
      variants: ["after", "before", "hover", "selection"],
    },
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
            primary: "#8077ff",
            secondary: "#fff",
            fill: "#8077ff",
            text: "#fff",
          },
          astar: {
            primary: "#1b6dc1d9",
            secondary: "#fff",
            fill: "#1b6dc1d9",
            text: "#fff",
          },
          "binance-smart-chain-mainnet": {
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
            primary: "#53cbc9",
            secondary: "#fff",
            fill: "#53cbc9",
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
            text: "#d3046f",
          },
          "polygon-mainnet": {
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
            primary: "#7b50c1",
            secondary: "#fff",
            fill: "#7b50c1",
          },
        },
      },
    },
  },
  plugins: [],
};
