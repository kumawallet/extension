import { ChainType } from "@src/types";
export interface Chain {
  name: string;
  network: string;
  logo: string;
  symbol: string;
  prefix ?: number;
  type: ChainType;
  isSupportSell?: boolean;
}
