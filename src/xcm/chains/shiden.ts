import { KUSAMA_PARACHAINS } from "@src/constants/chains";
import {
  XCM,
  XCM_DEFAULT_VERSIONS,
  getAssets,
  getBeneficiary,
  getDest,
} from "../utils";
import { Map, Version } from "../interfaces";

export const SHIDEN_EXTRINSICS: { [key: string]: Map } = {
  kusama: ({ address, amount, xcmPalletVersion }) => ({
    pallet: XCM.pallets.POLKADOT_XCM.NAME,
    method: XCM.pallets.POLKADOT_XCM.methods.RESERVE_WITHDRAW_ASSETS,
    extrinsicValues: {
      dest: getDest({
        parents: 1,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }),
      beneficiary: getBeneficiary({
        address,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }),
      assets: getAssets({
        fungible: amount,
        parents: 1,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }),
      feeAssetItem: 0,
    },
  }),

  "moonriver-evm": ({ address, amount, assetSymbol }) => {
    let method = null;
    let assets = null;
    let weightLimit = null;
    let version: Version | null = null;

    switch (assetSymbol?.toLowerCase()) {
      case "sdn": {
        version = "V2";
        method =
          XCM.pallets.POLKADOT_XCM.methods.LIMITED_RESERVE_TRANSFER_ASSETS;

        assets = getAssets({
          fungible: amount,
          version,
        });

        weightLimit = "Unlimited";

        break;
      }
      case "movr": {
        version = "V3";
        method = XCM.pallets.POLKADOT_XCM.methods.RESERVE_WITHDRAW_ASSETS;

        assets = getAssets({
          fungible: amount,
          version,
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
          version,
        }),
        beneficiary: getBeneficiary({
          address,
          account: "AccountKey20",
          version,
        }),
        assets,
        feeAssetItem: 0,
        weightLimit,
      },
    };
  },
};

enum SHIDEN_ASSETS {
  SDN = "SDN",
  MOVR = "MOVR",
  KSM = "KSM",
}

export const SHIDEN_ASSETS_MAPPING = {
  kusama: [SHIDEN_ASSETS.KSM],
  "moonbeam-evm": [SHIDEN_ASSETS.SDN, SHIDEN_ASSETS.MOVR],
};
