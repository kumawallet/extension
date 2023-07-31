import { POLKADOT_PARACHAINS } from "@src/constants/chains";
import {
  XCM,
  XCM_DEFAULT_VERSIONS,
  getAssets,
  getBeneficiary,
  getDest,
} from "../utils";
import { Map } from "../interfaces";

export const POLKADOT_EXTRINSICS: { [key: string]: Map } = {
  [POLKADOT_PARACHAINS.ASTAR.name]: ({
    address,
    amount,
    xcmPalletVersion,
  }) => ({
    pallet: XCM.pallets.XCM_PALLET.NAME,
    method: XCM.pallets.XCM_PALLET.methods.RESERVE_TRANSFER_ASSETS,
    extrinsicValues: {
      dest: getDest({
        parachainId: POLKADOT_PARACHAINS.ASTAR.id,
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
  [POLKADOT_PARACHAINS.MOONBEAM.name]: ({
    address,
    amount,
    xcmPalletVersion,
  }) => ({
    pallet: XCM.pallets.XCM_PALLET.NAME,
    method: XCM.pallets.XCM_PALLET.methods.LIMITED_RESERVE_TRANSFER_ASSETS,
    extrinsicValues: {
      dest: getDest({
        parachainId: POLKADOT_PARACHAINS.MOONBEAM.id,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }) as unknown,
      beneficiary: getBeneficiary({
        address,
        account: "AccountKey20",
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }) as unknown,
      assets: getAssets({
        fungible: amount,
        version: XCM_DEFAULT_VERSIONS[xcmPalletVersion],
      }) as unknown,
      feeAssetItem: 0,
      weightLimit: "Unlimited",
    },
  }),
  [POLKADOT_PARACHAINS.ACALA.name]: ({
    address,
    amount,
    xcmPalletVersion,
  }) => ({
    pallet: XCM.pallets.XCM_PALLET.NAME,
    method: XCM.pallets.XCM_PALLET.methods.LIMITED_RESERVE_TRANSFER_ASSETS,
    extrinsicValues: {
      dest: getDest({
        parachainId: POLKADOT_PARACHAINS.ACALA.id,
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
      weightLimit: "Unlimited",
    },
  }),
};
