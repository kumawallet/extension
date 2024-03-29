import {
  PARACHAINS,
  PARACHAINS_TESTNETS,
  RELAY_CHAINS,
  RELAY_CHAIN_TESTNETS,
} from "@src/constants/chains";
import { IXCM_MAPPING } from "./interfaces";
import {
  POLKADOT_EXTRINSICS,
  KUSAMA_EXTRINSICS,
  MOONBEAM_EXTRINSICS,
  ACALA_EXTRINSICS,
  ASTAR_EXTRINSICS,
  SHIDEN_EXTRINSICS,
  MOONRIVER_EXTRINSICS,
  ROCOCO_EXTRINSICS,
  ROCOCO_ASSET_HUB_EXTRINSICS,
} from "./chains";

export const XCM_MAPPING: IXCM_MAPPING = {
  [RELAY_CHAINS.POLKADOT]: POLKADOT_EXTRINSICS,
  [RELAY_CHAINS.KUSAMA]: KUSAMA_EXTRINSICS,
  [PARACHAINS.MOONBEAM]: MOONBEAM_EXTRINSICS,
  [PARACHAINS.ACALA]: ACALA_EXTRINSICS,
  [PARACHAINS.ASTAR]: ASTAR_EXTRINSICS,
  [PARACHAINS.MOONRIVER]: MOONRIVER_EXTRINSICS,
  [PARACHAINS.SHIDEN]: SHIDEN_EXTRINSICS,

  // testnest
  [RELAY_CHAIN_TESTNETS.ROCOCO]: ROCOCO_EXTRINSICS,
  [PARACHAINS_TESTNETS.ROCOCO_ASSET_HUB]: ROCOCO_ASSET_HUB_EXTRINSICS,
};
