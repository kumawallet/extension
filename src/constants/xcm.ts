import { BN, numberToHex, u8aToHex } from "@polkadot/util";
import {
  KUSAMA_PARACHAINS,
  PARACHAINS,
  POLKADOT_PARACHAINS,
  RELAY_CHAINS,
} from "./chains";
import { decodeAddress } from "@polkadot/util-crypto";
import { BN0 } from "./assets";
import xTokensAbi from "@src/abi/xtokens_moonbeam_abi.json";
import { BigNumberish } from "ethers";

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
  fungible: BN | BigNumberish | string;
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
  amount: BN | BigNumberish | string;
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

export interface MapResponseXCM {
  pallet: string;
  method: string;
  extrinsicValues: any;
}

export interface MapResponseEVM {
  contractAddress: string;
  abi: string;
  method: string;
  extrinsicValues: any;
}

type Map = (props: ExtrinsicValues) => MapResponseXCM | MapResponseEVM;

interface IXCM_MAPPING {
  [key: string]: {
    [key: string]: Map;
  };
}

export const XCM_MAPPING: IXCM_MAPPING = {
  [RELAY_CHAINS.POLKADOT]: {
    [POLKADOT_PARACHAINS.ASTAR.name]: ({ address, amount }) => ({
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
    [POLKADOT_PARACHAINS.MOONBEAM.name]: ({ address, amount }) => ({
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

  [PARACHAINS.MOONBEAM]: {
    [RELAY_CHAINS.POLKADOT]: ({ address, amount }) => {
      const _address =
        "0x01" + u8aToHex(decodeAddress(address), undefined, false) + "00";

      return {
        contractAddress: "0x0000000000000000000000000000000000000804",
        abi: xTokensAbi as any,
        method: "transfer",
        extrinsicValues: {
          currency_address: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080", //asset address
          amount: amount.toString(),
          destination: [1, [_address]],
          weight: "4000000000", // Weight
        },
      };
    },

    [PARACHAINS.ASTAR]: ({ address, amount, assetSymbol }) => {
      const addressIsHex = address.startsWith("0x");

      const _address = addressIsHex
        ? "0x03" + address.slice(2) + "00"
        : "0x01" + u8aToHex(decodeAddress(address), undefined, false) + "00";

      let currency_address = "";

      switch (assetSymbol?.toLowerCase()) {
        case "astr": {
          currency_address = "0x0000000000000000000000000000000000000802";
          break;
        }
        case "xcastr": {
          currency_address = "0xFfFFFfffA893AD19e540E172C10d78D4d479B5Cf";
          break;
        }
        default:
          throw new Error("Invalid asset symbol");
      }

      return {
        contractAddress: "0x0000000000000000000000000000000000000804",
        abi: xTokensAbi as any,
        method: "transfer",
        extrinsicValues: {
          currency_address, //asset address
          amount: amount.toString(),
          destination: [
            1,
            [
              "0x00" +
                "0000" +
                numberToHex(POLKADOT_PARACHAINS.ASTAR.id).split("0x")[1],
              _address,
            ],
          ],
          weight: "4000000000", // Weight
        },
      };
    },
  },

  [PARACHAINS.MOONRIVER]: {
    [RELAY_CHAINS.KUSAMA]: ({ address, amount }) => {
      const _address =
        "0x01" + u8aToHex(decodeAddress(address), undefined, false) + "00";

      return {
        contractAddress: "0x0000000000000000000000000000000000000804",
        abi: xTokensAbi as any,
        method: "transfer",
        extrinsicValues: {
          currency_address: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080", //asset address
          amount: amount.toString(),
          destination: [1, [_address]],
          weight: "4000000000", // Weight
        },
      };
    },

    [PARACHAINS.SHIDEN]: ({ address, amount, assetSymbol }) => {
      const addressIsHex = address.startsWith("0x");

      const _address = addressIsHex
        ? "0x03" + address.slice(2) + "00"
        : "0x01" + u8aToHex(decodeAddress(address), undefined, false) + "00";

      let currency_address = "";

      switch (assetSymbol?.toLowerCase()) {
        case "sdn": {
          currency_address = "0x0000000000000000000000000000000000000802";
          break;
        }
        case "xcsdn": {
          currency_address = "0xFFFfffFF0Ca324C842330521525E7De111F38972";
          break;
        }
        default:
          throw new Error("Invalid asset symbol");
      }

      return {
        contractAddress: "0x0000000000000000000000000000000000000804",
        abi: xTokensAbi as any,
        method: "transfer",
        extrinsicValues: {
          currency_address, //asset address
          amount: amount.toString(),
          destination: [
            1,
            [
              "0x00" +
                "0000" +
                numberToHex(POLKADOT_PARACHAINS.ASTAR.id).split("0x")[1],
              _address,
            ],
          ],
          weight: "4000000000", // Weight
        },
      };
    },
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

interface IXCM_ASSETS_MAPPING {
  [key: string]: {
    [key: string]: string[];
  };
}

export const XCM_ASSETS_MAPPING: IXCM_ASSETS_MAPPING = {
  [PARACHAINS.MOONBEAM]: {
    [RELAY_CHAINS.POLKADOT]: ["xcDOT"],
    [PARACHAINS.ASTAR]: ["GLMR", "xcASTR"],
  },
  [PARACHAINS.ASTAR]: {
    [RELAY_CHAINS.POLKADOT]: ["DOT"],
    [PARACHAINS.MOONBEAM]: ["ASTR", "GLMR"],
  },
  [PARACHAINS.MOONRIVER]: {
    [RELAY_CHAINS.KUSAMA]: ["xcKSM"],
    [PARACHAINS.SHIDEN]: ["MOVR", "xcSDN"],
  },
  [PARACHAINS.SHIDEN]: {
    [RELAY_CHAINS.KUSAMA]: ["KSM"],
    [PARACHAINS.MOONRIVER]: ["SDN", "MOVR"],
  },
};
