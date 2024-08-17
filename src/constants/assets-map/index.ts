import { ACALA_ASSETS } from "./acala";
import { ASTAR_ASSETS } from "./astar";
import { ROCOCO_ASSET_HUB_ASSETS } from "./rococo-asset-hub";
import { SHIBUYA_ASSETS } from "./shibuya";
import { HYDRADX_ASSETS } from "./hydradx"
import { HYDRADX_ASSETS_TESTNET } from "./hydradx-rococo";

export const SUBSTRATE_ASSETS_MAP: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
} = {
  acala: ACALA_ASSETS,
  astar: ASTAR_ASSETS,
  shibuya: SHIBUYA_ASSETS,
  hydradx: HYDRADX_ASSETS,
  "hydradx-rococo": HYDRADX_ASSETS_TESTNET,
  "rococo-asset-hub": ROCOCO_ASSET_HUB_ASSETS,
};
