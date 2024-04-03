import { KUSAMA_PARACHAINS } from "@src/constants/chains";
import {
  XCM,
  XCM_DEFAULT_VERSIONS,
  getAssets,
  getBeneficiary,
  getDest,
} from "../utils";
import { Map } from "../interfaces";

export const KUSAMA_EXTRINSICS: { [key: string]: Map } = {
  "moonriver-evm": ({ address, amount }) => ({
    pallet: XCM.pallets.XCM_PALLET.NAME,
    method: XCM.pallets.XCM_PALLET.methods.LIMITED_RESERVE_TRANSFER_ASSETS,
    extrinsicValues: {
      dest: getDest({
        parachainId: KUSAMA_PARACHAINS.MOONRIVER.id,
        version: "V2",
      }) as unknown,
      beneficiary: getBeneficiary({
        address,
        account: "AccountKey20",
        version: "V2",
      }) as unknown,
      assets: getAssets({
        fungible: amount,
        version: "V2",
      }) as unknown,
      feeAssetItem: 0,
      weightLimit: "Unlimited",
    },
  }),

  shiden: ({ address, amount, xcmPalletVersion }) => ({
    pallet: XCM.pallets.XCM_PALLET.NAME,
    method: XCM.pallets.XCM_PALLET.methods.RESERVE_TRANSFER_ASSETS,
    extrinsicValues: {
      dest: getDest({
        parachainId: KUSAMA_PARACHAINS.SHIDEN.id,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }) as unknown,
      beneficiary: getBeneficiary({
        address,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }) as unknown,
      assets: getAssets({
        fungible: amount,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }) as unknown,
      feeAssetItem: 0,
    },
  }),
};
