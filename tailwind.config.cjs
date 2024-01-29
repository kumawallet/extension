module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    {
      pattern: /^bg-chain-.*-(primary|secondary|fill|text)$/,
      variants: ["hover", "after", "hover:enabled"],
    },
    {
      pattern: /(text|border|fill|text|border)-chain/,
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
          bg: "#986bff",
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
          },
          astar: {
            primary: "#1b6dc1d9",
            secondary: "#fff",
            fill: "#1b6dc1d9",
          },
          "binance-smart-chain-mainnet": {
            primary: "#f3ba2f",
            secondary: "#fff",
            fill: "#f3ba2f",
          },
          default: {
            primary: "#7a49d8",
            secondary: "#fff",
            fill: "#7a49d8",
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
