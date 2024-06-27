import { Chain, ChainType } from "@src/types";
import { ASSETS_ICONS } from "../assets-icons";

export const OL_CHAINS: Chain[] = [
  {
    id: "ol",
    name: "Open Libra",
    rpcs: ["http://rpc.openlibra.blockcoders.io:8080/v1"],
    symbol: "$LIBRA",
    decimals: 6,
    explorer: "https://0l.fyi",
    logo: ASSETS_ICONS["OL"],
    isTestnet: false,
    isCustom: false,
    type: ChainType.OL,
  },
];
