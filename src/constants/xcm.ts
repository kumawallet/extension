import { BN, u8aToHex } from "@polkadot/util";
import {
  KUSAMA_PARACHAINS,
  PARACHAINS,
  POLKADOT_PARACHAINS,
  RELAY_CHAINS,
} from "./chains";
import { decodeAddress } from "@polkadot/util-crypto";
import { BN0 } from "./assets";

export const XCM = {
  pallets: {
    XCM_PALLET: {
      NAME: "xcmPallet",
      methods: {
        RESERVE_TRANSFER_ASSETS: "reserveTransferAssets",
        LIMITED_RESERVE_TRANSFER_ASSETS: "limitedReserveTransferAssets",
      },
    },
    POLKADOT_XCM: {
      NAME: "polkadotXcm",
      methods: {
        RESERVE_WITHDRAW_ASSETS: "reserveWithdrawAssets",
        RESERVE_TRANSFER_ASSETS: "reserveTransferAssets",
        LIMITED_RESERVE_TRANSFER_ASSETS: "limitedReserveTransferAssets",
      },
    },
  },
};

export const getDest = ({
  parents = 0,
  parachainId = null,
  version = "V1",
}: any) => {
  return {
    [version]: {
      parents,
      interior: parachainId
        ? {
            X1: {
              Parachain: {
                id: parachainId,
              },
            },
          }
        : "Here",
    },
  };
};

export const getAssets = ({
  version = "V1",
  fungible = BN0,
  interior = "Here",
  parents = 0,
}: {
  version?: "V0" | "V1" | "V2" | "V3";
  fungible: BN;
  interior?: "Here" | any;
  parents?: 0 | 1;
}) => {
  if (version === "V1") {
    return {
      V1: [
        {
          id: {
            Concrete: {
              parents,
              interior,
            },
          },
          fun: {
            Fungible: fungible,
          },
        },
      ],
    };
  }

  if (version === "V0") {
    return {
      V0: [
        {
          ConcreteFungible: {
            id: "Null",
            amount: fungible,
          },
        },
      ],
    };
  }
};

interface ExtrinsicValues {
  address: string;
  amount: BN;
  assetSymbol?: string;
}

export const getBeneficiary = ({
  address = "",
  version = "V1",
  account = "AccountId32",
}) => {
  const isHex = address.startsWith("0x");

  const accountId = isHex ? address : u8aToHex(decodeAddress(address));

  const accountKey = account === "AccountId32" ? "id" : "key";

  return {
    [version]: {
      parents: 0,
      interior: {
        X1: {
          [account]: {
            network: "Any",
            [accountKey]: accountId,
          },
        },
      },
    },
  };
};

interface MapResponse {
  pallet: string;
  method: string;
  extrinsicValues: any;
}

type Map = (props: ExtrinsicValues) => MapResponse;

interface IXCM_MAPPING {
  [key: string]: {
    [key: string]: Map;
  };
}

export const XCM_MAPPING: IXCM_MAPPING = {
  [RELAY_CHAINS.POLKADOT as string]: {
    [POLKADOT_PARACHAINS.ASTAR.name as string]: ({ address, amount }) => ({
      pallet: XCM.pallets.XCM_PALLET.NAME,
      method: XCM.pallets.XCM_PALLET.methods.RESERVE_TRANSFER_ASSETS,
      extrinsicValues: {
        dest: getDest({
          parachainId: POLKADOT_PARACHAINS.ASTAR.id,
        }),
        beneficiary: getBeneficiary({
          address,
        }),
        asssets: getAssets({
          fungible: amount,
        }),
        feeAssetItem: 0,
      },
    }),
    [POLKADOT_PARACHAINS.MOONBEAM.name as string]: ({ address, amount }) => ({
      pallet: XCM.pallets.XCM_PALLET.NAME,
      method: XCM.pallets.XCM_PALLET.methods.LIMITED_RESERVE_TRANSFER_ASSETS,
      extrinsicValues: {
        dest: getDest({
          parachainId: POLKADOT_PARACHAINS.MOONBEAM.id,
        }),
        beneficiary: getBeneficiary({
          address,
          account: "AccountKey20",
        }),
        asssets: getAssets({
          fungible: amount,
          version: "V0",
        }),
        feeAssetItem: 0,
        weightLimit: {
          Limited: 1_000_000_000,
        },
      },
    }),
  },

  [PARACHAINS.ASTAR]: {
    [RELAY_CHAINS.POLKADOT]: ({ address, amount }) => ({
      pallet: XCM.pallets.POLKADOT_XCM.NAME,
      method: XCM.pallets.POLKADOT_XCM.methods.RESERVE_WITHDRAW_ASSETS,
      extrinsicValues: {
        dest: getDest({
          parents: 1,
        }),
        beneficiary: getBeneficiary({
          address,
        }),
        assets: getAssets({
          fungible: amount,
          parents: 1,
        }),
        feeAssetItem: 0,
      },
    }),

    [PARACHAINS.MOONBEAM]: ({ address, amount, assetSymbol }) => {
      let assets = null;
      switch (assetSymbol?.toLowerCase()) {
        case "astr": {
          assets = getAssets({
            fungible: amount,
          });
          break;
        }
        case "glmr": {
          assets = getAssets({
            fungible: amount,
            interior: {
              X2: [
                {
                  Parachain: POLKADOT_PARACHAINS.MOONBEAM.id,
                },
                {
                  PalletInstance: 10,
                },
              ],
            },
          });
          break;
        }
        default:
          throw new Error("Invalid asset symbol");
      }
      return {
        pallet: XCM.pallets.POLKADOT_XCM.NAME,
        method:
          XCM.pallets.POLKADOT_XCM.methods.LIMITED_RESERVE_TRANSFER_ASSETS,
        extrinsicValues: {
          dest: getDest({
            parents: 1,
            parachainId: POLKADOT_PARACHAINS.MOONBEAM.id,
          }),
          beneficiary: getBeneficiary({
            address,
            account: "AccountKey20",
          }),
          assets,
          feeAssetItem: 0,
          weightLimit: "Unlimited",
        },
      };
    },
  },

  [PARACHAINS.SHIDEN]: {
    [RELAY_CHAINS.KUSAMA]: ({ address, amount }) => ({
      pallet: XCM.pallets.POLKADOT_XCM.NAME,
      method: XCM.pallets.POLKADOT_XCM.methods.RESERVE_WITHDRAW_ASSETS,
      extrinsicValues: {
        dest: getDest({
          parents: 1,
        }),
        beneficiary: getBeneficiary({
          address,
        }),
        assets: getAssets({
          fungible: amount,
          parents: 1,
        }),
        feeAssetItem: 0,
      },
    }),

    [PARACHAINS.MOONRIVER]: ({ address, amount, assetSymbol }) => {
      let method = null;
      let assets = null;
      let weightLimit = null;

      switch (assetSymbol?.toLowerCase()) {
        case "sdn": {
          method =
            XCM.pallets.POLKADOT_XCM.methods.LIMITED_RESERVE_TRANSFER_ASSETS;

          weightLimit = {
            Limited: 1_000_000_000,
          };

          assets = getAssets({
            fungible: amount,
          });

          break;
        }
        case "movr": {
          method = XCM.pallets.POLKADOT_XCM.methods.RESERVE_WITHDRAW_ASSETS;

          assets = getAssets({
            fungible: amount,
            version: "V3",
            parents: 1,
            interior: {
              X2: [
                {
                  Parachain: KUSAMA_PARACHAINS.MOONRIVER.id,
                },
                {
                  PalletInstance: 10,
                },
              ],
            },
          });

          break;
        }
        default:
          throw new Error("Invalid asset symbol");
      }

      return {
        pallet: XCM.pallets.POLKADOT_XCM.NAME,
        method,
        extrinsicValues: {
          dest: getDest({
            parents: 1,
            parachainId: KUSAMA_PARACHAINS.MOONRIVER.id,
            version: "V3",
          }),
          beneficiary: getBeneficiary({
            address,
            account: "AccountKey20",
            version: "V3",
          }),
          assets,
          feeAssetItem: 0,
          weightLimit,
        },
      };
    },
  },
};
