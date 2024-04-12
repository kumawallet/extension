import { ACALA_ASSETS } from "./acala";
import { ASTAR_ASSETS } from "./astar";
import { ROCOCO_ASSET_HUB_ASSETS } from "./rococo-asset-hub";
import { SHIBUYA_ASSETS } from "./shibuya";

export const SUBSTRATE_ASSETS_MAP: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
} = {
  acala: ACALA_ASSETS,
  astar: ASTAR_ASSETS,
  shibuya: SHIBUYA_ASSETS,
  "rococo-asset-hub": ROCOCO_ASSET_HUB_ASSETS,
};
