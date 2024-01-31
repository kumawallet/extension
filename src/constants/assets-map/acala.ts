const getNativeAssetId = ({
  id = "Token",
  token,
}: {
  id?: "Token" | "LiquidCrowdloan";
  token: number | string;
}) => {
  return {
    [id]: token,
  };
};

const getERC20 = (address: string) => {
  return {
    Erc20: address,
  };
};

const getStableAssetId = (id: number) => {
  return {
    StableAssetPoolToken: id,
  };
};

const getForeignAssetId = (id: number) => {
  return {
    ForeignAsset: id,
  };
};

export const ACALA_ASSETS = [
  {
    symbol: "tDOT",
    id: getStableAssetId(0),
    decimals: 10,
  },
  {
    symbol: "lcDOT",
    id: getNativeAssetId({
      id: "LiquidCrowdloan",
      token: 13,
    }),
    decimals: 10,
  },
  {
    symbol: "INTR",
    id: getForeignAssetId(4),
    decimals: 10,
  },
  {
    symbol: "ASTR",
    id: getForeignAssetId(2),
    decimals: 18,
  },
  {
    symbol: "PHA",
    id: getForeignAssetId(9),
    decimals: 12,
  },
  {
    symbol: "GLMR",
    id: getForeignAssetId(0),
    decimals: 18,
  },
  {
    symbol: "LDOT",
    id: getNativeAssetId({
      token: "LDOT",
    }),
    decimals: 10,
  },
  // {
  //   symbol: "DAI",
  //   id: getERC20("0x54a37a01cd75b616d63e0ab665bffdb0143c52ae"),
  // },
  // {
  //   symbol: "SHIB",
  //   id: getERC20("0xaf6997a70feb868df863d5380c3ab93da4297edc"),
  // },
  {
    symbol: "USDT",
    id: getForeignAssetId(12),
    decimals: 6,
  },
  {
    symbol: "DOT",
    id: getNativeAssetId({
      token: "DOT",
    }),
    decimals: 10,
  },
  {
    symbol: "EQ",
    id: getForeignAssetId(7),
    decimals: 9,
  },
];
