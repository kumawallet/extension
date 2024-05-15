import { Chain } from "@src/types";
import { ASSETS_ICONS } from "../assets-icons";

export const OL_CHAINS: Chain[] = [
  {
    id: "ol",
    name: "Open Libra",
    rpcs: [],
    symbol: "OL",
    decimals: 6,
    explorer: "https://0l.fyi",
    logo: ASSETS_ICONS["OL"],
    isTestnet: false,
    isCustom: false,
    type: "ol",
  },
];
