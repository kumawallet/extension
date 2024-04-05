import { ROCOCO_PARACHAINS } from "@src/constants/chains";
import { Map } from "../interfaces";
import {
  XCM,
  XCM_DEFAULT_VERSIONS,
  getAssets,
  getBeneficiary,
  getDest,
} from "../utils";

export const ROCOCO_EXTRINSICS: { [key: string]: Map } = {
  "rococo-asset-hub": ({ address, amount, xcmPalletVersion }) => ({
    pallet: XCM.pallets.XCM_PALLET.NAME,
    method: XCM.pallets.XCM_PALLET.methods.LIMITED_TELEPORT_ASSETS,
    extrinsicValues: {
      dest: getDest({
        parachainId: ROCOCO_PARACHAINS.ASSET_HUB.id,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }),
      beneficiary: getBeneficiary({
        address,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }),
      assets: getAssets({
        fungible: amount,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }),
      feeAssetItem: 0,
      destWeightLimit: "Unlimited",
    },
  }),
};
