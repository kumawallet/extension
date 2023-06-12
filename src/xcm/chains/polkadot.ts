import { POLKADOT_PARACHAINS } from "@src/constants/chains";
import { XCM, getAssets, getBeneficiary, getDest } from "../utils";
import { Map } from "../interfaces";

export const POLKADOT_EXTRINSICS: { [key: string]: Map } = {
  [POLKADOT_PARACHAINS.ASTAR.name]: ({ address, amount }) => ({
    pallet: XCM.pallets.XCM_PALLET.NAME,
    method: XCM.pallets.XCM_PALLET.methods.RESERVE_TRANSFER_ASSETS,
    extrinsicValues: {
      dest: getDest({
        parachainId: POLKADOT_PARACHAINS.ASTAR.id,
      }) as unknown,
      beneficiary: getBeneficiary({
        address,
      }) as unknown,
      assets: getAssets({
        fungible: amount,
      }) as unknown,
      feeAssetItem: 0,
    },
  }),
  [POLKADOT_PARACHAINS.MOONBEAM.name]: ({ address, amount }) => ({
    pallet: XCM.pallets.XCM_PALLET.NAME,
    method: XCM.pallets.XCM_PALLET.methods.LIMITED_RESERVE_TRANSFER_ASSETS,
    extrinsicValues: {
      dest: getDest({
        parachainId: POLKADOT_PARACHAINS.MOONBEAM.id,
      }) as unknown,
      beneficiary: getBeneficiary({
        address,
        account: "AccountKey20",
      }) as unknown,
      assets: getAssets({
        fungible: amount,
        version: "V0",
      }) as unknown,
      feeAssetItem: 0,
      weightLimit: {
        Limited: 1_000_000_000,
      },
    },
  }),
  [POLKADOT_PARACHAINS.ACALA.name]: ({ address, amount }) => ({
    pallet: XCM.pallets.XCM_PALLET.NAME,
    method: XCM.pallets.XCM_PALLET.methods.LIMITED_RESERVE_TRANSFER_ASSETS,
    extrinsicValues: {
      dest: getDest({
        parachainId: POLKADOT_PARACHAINS.ACALA.id,
        version: "V0",
      }) as unknown,
      beneficiary: getBeneficiary({
        address,
        version: "V0",
      }) as unknown,
      assets: getAssets({
        fungible: amount,
        version: "V0",
      }) as unknown,
      feeAssetItem: 0,
    },
  }),
};
