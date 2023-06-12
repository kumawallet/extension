import {
  PARACHAINS,
  POLKADOT_PARACHAINS,
  RELAY_CHAINS,
} from "@src/constants/chains";
import { XCM, getAssets, getBeneficiary, getDest } from "../utils";
import { Map } from "../interfaces";

export const ASTAR_EXTRINSICS: { [key: string]: Map } = {
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
      method: XCM.pallets.POLKADOT_XCM.methods.LIMITED_RESERVE_TRANSFER_ASSETS,
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

  [PARACHAINS.ACALA]: ({ address, amount, assetSymbol }) => {
    let assets = null;
    let method = null;

    switch (assetSymbol?.toLowerCase()) {
      case "astr": {
        method = XCM.pallets.XCM_PALLET.methods.RESERVE_TRANSFER_ASSETS;
        assets = getAssets({
          fungible: amount,
        });
        break;
      }
      case "aca": {
        method = XCM.pallets.POLKADOT_XCM.methods.RESERVE_WITHDRAW_ASSETS;
        assets = getAssets({
          fungible: amount,
          interior: {
            X2: [
              {
                Parachain: POLKADOT_PARACHAINS.ACALA.id,
              },
              {
                GeneralKey: "0x0000",
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
        }),
        beneficiary: getBeneficiary({
          address,
        }),
        assets,
        feeAssetItem: 0,
      },
    };
  },
};

enum ASTAR_ASSETS {
  DOT = "DOT",
  ASTR = "ASTR",
  GLMR = "GLMR",
  ACA = "ACA",
}

export const ASTAR_ASSETS_MAPPING = {
  [RELAY_CHAINS.POLKADOT]: [ASTAR_ASSETS.DOT],
  [PARACHAINS.MOONBEAM]: [ASTAR_ASSETS.ASTR, ASTAR_ASSETS.GLMR],
  [PARACHAINS.ACALA]: [ASTAR_ASSETS.ASTR, ASTAR_ASSETS.ACA],
};
