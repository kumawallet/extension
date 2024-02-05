import { ACALA, ASTAR, ROCOCO_ASSET_HUB, SHIBUYA } from "../chains";
import { ACALA_ASSETS } from "./acala";
import { ASTAR_ASSETS } from "./astar";
import { ROCOCO_ASSET_HUB_ASSETS } from "./rococo-asset-hub";
import { SHIBUYA_ASSETS } from "./shibuya";

export const SUBSTRATE_ASSETS_MAP = {
  [ACALA.name]: ACALA_ASSETS,
  [ASTAR.name]: ASTAR_ASSETS,
  [SHIBUYA.name]: SHIBUYA_ASSETS,
  [ROCOCO_ASSET_HUB.name]: ROCOCO_ASSET_HUB_ASSETS,
};
