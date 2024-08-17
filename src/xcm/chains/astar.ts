import { POLKADOT_PARACHAINS } from "@src/constants/chains";
import {
  XCM,
  XCM_DEFAULT_VERSIONS,
  getAssets,
  getBeneficiary,
  getDest,
  getXTokensAsset,
  transformAddress,
} from "../utils";
import { Map } from "../interfaces";

export const ASTAR_EXTRINSICS: { [key: string]: Map } = {
  polkadot: ({ address, amount, xcmPalletVersion }) => ({
    pallet: XCM.pallets.X_TOKENS.NAME,
    method: XCM.pallets.X_TOKENS.methods.TRANSFER_MULTIASSET,
    extrinsicValues: {
      asset: getXTokensAsset({
        fungible: amount,
        parents: 1,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }),
      dest: getBeneficiary({
        parents: 1,
        address,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }),
      destWeightLimit: "Unlimited",
    },
  }),

  moonbeam: ({ address, amount, assetSymbol, xcmPalletVersion }) => {
    let assets = null;
    switch (assetSymbol?.toLowerCase()) {
      case "astr": {
        assets = getAssets({
          version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
          fungible: amount,
        });
        break;
      }
      case "glmr": {
        assets = getAssets({
          version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
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
      method: XCM.pallets.POLKADOT_XCM.methods.LIMITED_RESERVE_TRANSFER_ASSETS,
      extrinsicValues: {
        dest: getDest({
          parents: 1,
          parachainId: POLKADOT_PARACHAINS.MOONBEAM.id,
          version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
        }),
        beneficiary: getBeneficiary({
          address,
          account: "AccountKey20",
          version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
        }),
        assets,
        feeAssetItem: 0,
        weightLimit: "Unlimited",
      },
    };
  },

  acala: ({ address, amount, assetSymbol, xcmPalletVersion }) => {
    let assets = null;
    let method = null;

    switch (assetSymbol?.toLowerCase()) {
      case "astr": {
        method = XCM.pallets.XCM_PALLET.methods.RESERVE_TRANSFER_ASSETS;
        assets = getAssets({
          version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
          fungible: amount,
        });
        break;
      }
      case "aca": {
        method = XCM.pallets.POLKADOT_XCM.methods.RESERVE_WITHDRAW_ASSETS;
        assets = getAssets({
          version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
          fungible: amount,
          interior: {
            X2: [
              {
                Parachain: POLKADOT_PARACHAINS.ACALA.id,
              },
              {
                GeneralKey: {
                  data: "0x0000000000000000000000000000000000000000000000000000000000000000",
                  length: 2,
                },
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
          parachainId: POLKADOT_PARACHAINS.ACALA.id,
          version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
        }),
        beneficiary: getBeneficiary({
          address,
          version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
        }),
        assets,
        feeAssetItem: 0,
      },
    };
  },
  hydradx: ({ address, amount,assetSymbol, xcmPalletVersion }) => {
    let assets = null;
    let method = null;
    switch (assetSymbol?.toLowerCase()) {
      case "astr": {
        assets = getAssets({
          version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
          fungible: amount,
        });
        method = XCM.pallets.POLKADOT_XCM.methods.RESERVE_TRANSFER_ASSETS
        return {
          pallet: XCM.pallets.POLKADOT_XCM.NAME,
          method,
          extrinsicValues: {
            dest: getDest({
              parents: 1,
              parachainId: POLKADOT_PARACHAINS.HYDRADX.id,
              version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
              interior: {
                X1: {
                  Parachain: POLKADOT_PARACHAINS.HYDRADX.id
                }
              }
            }),
            beneficiary: getBeneficiary({
              address,
              account: "AccountId32",
              version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
            }),
            assets,
            feeAssetItem: 0,
          },
        };
      }
      case "dot": {
        const { accountId } = transformAddress(address);
        
        method= XCM.pallets.X_TOKENS.methods.TRANSFER;
        
        return {
          pallet: XCM.pallets.X_TOKENS.NAME,
          method,
          extrinsicValues: {
            currency_id: "340282366920938463463374607431768211455",
            amount,
            dest: getDest({
              parents: 1,
              version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
              interior: {
                X2: [
                      {
                          Parachain:POLKADOT_PARACHAINS.HYDRADX.id
                      },
                      {
                        AccountId32:{
                              network:null,
                              id: accountId
                        }
                      }
                    ]
                  }
            }),
            dest_weight_limit: "Unlimited",
          },
        };
      }
      default:
        throw new Error("Invalid asset symbol");
    }
    
  },
};

enum ASTAR_ASSETS {
  DOT = "DOT",
  ASTR = "ASTR",
  GLMR = "GLMR",
  ACA = "ACA",
}

export const ASTAR_ASSETS_MAPPING = {
  polkadot: [ASTAR_ASSETS.DOT],
  "moonbeam-evm": [ASTAR_ASSETS.ASTR, ASTAR_ASSETS.GLMR],
  acala: [ASTAR_ASSETS.ASTR, ASTAR_ASSETS.ACA],
  hydradx: [ASTAR_ASSETS.ASTR,ASTAR_ASSETS.DOT]
};
