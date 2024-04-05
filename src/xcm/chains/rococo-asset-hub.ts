import { Map } from "../interfaces";
import { XCM, getAssets, getBeneficiary, getDest } from "../utils";

export const ROCOCO_ASSET_HUB_EXTRINSICS: { [key: string]: Map } = {
  rococo: ({ address, amount }) => ({
    pallet: XCM.pallets.POLKADOT_XCM.NAME,
    method: XCM.pallets.POLKADOT_XCM.methods.LIMITED_TELEPORT_ASSETS,
    extrinsicValues: {
      dest: getDest({
        parents: 1,
        version: "V3",
      }),
      beneficiary: getBeneficiary({
        address,
        version: "V3",
      }),
      assets: getAssets({
        fungible: amount,
        parents: 1,
        version: "V3",
      }),
      feeAssetItem: 0,
      destWeightLimit: "Unlimited",
    },
  }),
};

enum ASSET_HUB_ASSETS {
  ROC = "ROC",
}

export const ROCOCO_ASSET_HUB_ASSETS_MAPPING = {
  rococo: [ASSET_HUB_ASSETS.ROC],
};
