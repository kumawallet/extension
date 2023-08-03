import {
  PARACHAINS,
  POLKADOT_PARACHAINS,
  RELAY_CHAINS,
} from "@src/constants/chains";
import {
  XCM,
  XCM_DEFAULT_VERSIONS,
  getBeneficiary,
  transformAddress,
} from "../utils";
import { Map } from "../interfaces";

export const ACALA_EXTRINSICS: { [key: string]: Map } = {
  [RELAY_CHAINS.POLKADOT]: ({ address, amount, xcmPalletVersion }) => ({
    pallet: XCM.pallets.POLKADOT_XCM.NAME,
    method: XCM.pallets.X_TOKENS.methods.TRANSFER,
    extrinsicValues: {
      currencyId: {
        Token: "DOT",
      },
      amount,
      dest: getBeneficiary({
        address,
        parents: 1,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }),
      destWeightLimit: "Unlimited",
    },
  }),

  [PARACHAINS.ASTAR]: ({ address, amount, assetSymbol, xcmPalletVersion }) => {
    let currencyId = null;
    const destWeightLimit = "Unlimited";

    switch (assetSymbol?.toLowerCase()) {
      case "aca": {
        currencyId = {
          Token: "ACA",
        };
        break;
      }

      case "astr": {
        currencyId = {
          ForeignAsset: 2,
        };
        break;
      }
      default:
        throw new Error("Invalid asset symbol");
    }

    const { accountId } = transformAddress(address);

    return {
      pallet: XCM.pallets.X_TOKENS.NAME,
      method: XCM.pallets.X_TOKENS.methods.TRANSFER,
      extrinsicValues: {
        currencyId,
        amount,
        dest: {
          [XCM_DEFAULT_VERSIONS[xcmPalletVersion]]: {
            parents: 1,
            interior: {
              X2: [
                {
                  Parachain: POLKADOT_PARACHAINS.ASTAR.id,
                },
                {
                  AccountId32: {
                    network: "Any",
                    id: accountId,
                  },
                },
              ],
            },
          },
        },
        destWeightLimit,
      },
    };
  },

  [PARACHAINS.MOONBEAM]: ({
    address,
    amount,
    assetSymbol,
    xcmPalletVersion,
  }) => {
    let currencyId = null;
    let destWeightLimit: string | { Limited: number } = "Unlimited";

    switch (assetSymbol?.toLowerCase()) {
      case "aca": {
        currencyId = {
          Token: "ACA",
        };
        destWeightLimit = {
          Limited: 1_000_000_000,
        };
        break;
      }

      case "glmr": {
        currencyId = {
          ForeignAsset: 0,
        };
        break;
      }
      default:
        throw new Error("Invalid asset symbol");
    }

    const { accountId } = transformAddress(address);

    return {
      pallet: XCM.pallets.X_TOKENS.NAME,
      method: XCM.pallets.X_TOKENS.methods.TRANSFER,
      extrinsicValues: {
        currencyId,
        amount,
        dest: {
          [XCM_DEFAULT_VERSIONS[xcmPalletVersion]]: {
            parents: 1,
            interior: {
              X2: [
                {
                  Parachain: POLKADOT_PARACHAINS.MOONBEAM.id,
                },
                {
                  AccountKey20: {
                    network: "Any",
                    key: accountId,
                  },
                },
              ],
            },
          },
        } as unknown,
        destWeightLimit,
      },
    };
  },
};

enum ACALA_ASSETS {
  DOT = "DOT",
  ACA = "ACA",
  ASTR = "ASTR",
  GLMR = "GLMR",
}

export const ACALA_ASSETS_MAPPING = {
  [RELAY_CHAINS.POLKADOT]: [ACALA_ASSETS.DOT],
  [PARACHAINS.ASTAR]: [ACALA_ASSETS.ACA, ACALA_ASSETS.ASTR],
  [PARACHAINS.MOONBEAM]: [ACALA_ASSETS.ACA, ACALA_ASSETS.GLMR],
};
