export const enum RELAY_CHAINS {
  POLKADOT = "Polkadot",
  KUSAMA = "Kusama",
}

export const enum PARACHAINS {
  ASTAR = "Astar",
  MOONBEAM = "Moonbeam",
  SHIDEN = "Shiden",
  MOONRIVER = "Moonriver",
  ACALA = "Acala",
  HYDRADX = "Hydration"
}

export const enum RELAY_CHAIN_TESTNETS {
  ROCOCO = "Rococo",
}

export const enum PARACHAINS_TESTNETS {
  ROCOCO_ASSET_HUB = "Asset Hub (Rococo)",
}

export const POLKADOT_PARACHAINS = {
  ACALA: {
    name: PARACHAINS.ACALA,
    id: 2000,
  },
  ASTAR: {
    name: PARACHAINS.ASTAR,
    id: 2006,
  },
  MOONBEAM: {
    name: PARACHAINS.MOONBEAM,
    id: 2004,
  },
  HYDRADX: {
    name: PARACHAINS.HYDRADX,
    id: 2034
  }
};

export const KUSAMA_PARACHAINS = {
  SHIDEN: {
    name: PARACHAINS.SHIDEN,
    id: 2007,
  },
  MOONRIVER: {
    name: PARACHAINS.MOONRIVER,
    id: 2023,
  },
};

export const ROCOCO_PARACHAINS = {
  ASSET_HUB: {
    name: PARACHAINS_TESTNETS.ROCOCO_ASSET_HUB,
    id: 1000,
  },
};
