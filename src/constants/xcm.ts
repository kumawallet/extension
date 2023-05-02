import { u8aToHex } from "@polkadot/util";
import { ASTAR, PARACHAINS_ID, POLKADOT } from "./chains";
import { decodeAddress } from "@polkadot/util-crypto";

const enum RELAY_CHAINS {
  POLKADOT = "Polkadot",
  KUSAMA = "Kusama",
}

const enum PARACHAINS {
  ASTAR = "Astar",
  MOONBEAM = "Moonbeam",
}

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
      },
    },
    // X_TOKENS: {
    //   NAME: "xTokens",
    //   methods: {
    //     TRANSFER_MULTI_ASSET: "transferMultiasset",
    //   },
    // },
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

type Account = "AccountId32" | "AccountKey20";

export const getBeneficiary = ({
  address = "",
  version = "V1",
  account = "AccountId32",
}) => {
  const isHex = address.startsWith("0x");

  const accountId = isHex ? address : u8aToHex(decodeAddress(address));

  return {
    [version]: {
      parents: 0,
      interior: {
        X1: {
          [account]: {
            network: "Any",
            id: accountId,
          },
        },
      },
    },
  };
};

export const XCM_MAPPING = {
  [RELAY_CHAINS.POLKADOT]: {
    [PARACHAINS.ASTAR]: {
      pallet: XCM.pallets.POLKADOT_XCM.NAME,
      method: XCM.pallets.POLKADOT_XCM.methods.RESERVE_WITHDRAW_ASSETS,
      getValues: (address: any, amount: any) => {
        return {
          dest: getDest({
            parachainId: PARACHAINS_ID.ASTAR,
          }),
          beneficiary: getBeneficiary({
            address,
          }),
          asssets: {
            V1: [
              {
                id: {
                  Concrete: {
                    parents: 0,
                    interior: "Here",
                  },
                },
                fun: {
                  Fungible: amount,
                },
              },
            ],
          },
          feeAssetItem: 0,
        };
      },
    },

    [PARACHAINS.MOONBEAM]: {
      pallet: XCM.pallets.XCM_PALLET.NAME,
      method: XCM.pallets.XCM_PALLET.methods.LIMITED_RESERVE_TRANSFER_ASSETS,
      getValues: (address: any, amount: any) => {
        return {
          dest: getDest({
            parachainId: 2004,
          }),
          beneficiary: getBeneficiary({ address }),
          asssets: {
            V0: [
              {
                ConcreteFungible: {
                  id: "Null",
                  amount,
                },
              },
            ],
          },
          feeAssetItem: 0,
          weightLimit: 1_000_000_000,
        };
      },
    },
  },

  [PARACHAINS.ASTAR]: {
    [RELAY_CHAINS.POLKADOT]: {
      pallet: XCM.pallets.POLKADOT_XCM.NAME,
      method: XCM.pallets.POLKADOT_XCM.methods.RESERVE_WITHDRAW_ASSETS,
      getValues: (address: any, amount: any) => {
        return {
          dest: getDest({
            parents: 1,
          }),
          beneficiary: getBeneficiary({
            address,
          }),
          asssets: {
            V1: [
              {
                id: {
                  Concrete: {
                    parents: 1,
                    interior: "Here",
                  },
                },
                fun: {
                  Fungible: amount,
                },
              },
            ],
          },
          feeAssetItem: 0,
        };
      },
    },

    [PARACHAINS.MOONBEAM]: {
      pallet: XCM.pallets.POLKADOT_XCM.NAME,
      method: XCM.pallets.POLKADOT_XCM.methods.RESERVE_TRANSFER_ASSETS,
      getValues: (address: any, amount: any) => {
        return {
          dest: getDest({
            parents: 1,
            parachainId: 2004,
          }),
          beneficiary: getBeneficiary({
            address,
            account: "AccountKey20",
          }),
          asssets: {
            V1: [
              {
                id: {
                  Concrete: {
                    parents: 0,
                    interior: "Here",
                  },
                },
                fun: {
                  Fungible: amount,
                },
              },
            ],
          },
          feeAssetItem: 0,
        };
      },
    },
  },

  // [PARACHAINS.MOONBEAM]: {
  //   ["Astar"]: {
  //     pallet: XCM.pallets.X_TOKENS.NAME,
  //     method: XCM.pallets.X_TOKENS.methods.TRANSFER_MULTI_ASSET,
  //     getValues: (address: any, amount: any) => {
  //       return {
  //         asssets: {
  //           V1: [
  //             {
  //               id: {
  //                 Concrete: {
  //                   parents: 0,
  //                   interior: {
  //                     X1: {
  //                       PalletInstance: 10,
  //                     },
  //                   },
  //                 },
  //               },
  //               fun: {
  //                 Fungible: amount,
  //               },
  //             },
  //           ],
  //         },
  //         dest: {
  //           V1: {
  //             parents: 1,
  //             interior: {
  //               X2: [
  //                 {
  //                   Parachain: 2006,
  //                 },
  //                 {
  //                   AccountId32: {
  //                     network: "Any",
  //                     id: address,
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //         },
  //         weightLimit: {
  //           Limited: 4000000000,
  //         },
  //       };
  //     },
  //   },
  // },
};
