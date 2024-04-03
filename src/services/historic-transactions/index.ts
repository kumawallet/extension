import { HistoricTransaction } from "@src/types";
import { SubqueryHandler } from "./subquery";

const CHAINS_CONFIG: {
  [chainId: string]: string;
} = {
  polkadot: "subquery",
  acala: "subquery",
  astar: "subquery",
  "astar-evm": "subquery",
  "moonbeam-evm": "subquery",
  ethereum: "subquery",
  polygon: "subquery",
  binance: "subquery",
};

export const getChainHistoricHandler = async ({
  chainId,
  address,
}: {
  chainId: string;
  address: string;
}): Promise<HistoricTransaction[] | null> => {
  const chainConfig = CHAINS_CONFIG[chainId];

  if (!chainConfig) return null;

  if (chainConfig === "subquery") {
    const subquery = new SubqueryHandler(chainId, address);
    return subquery.getHistoricTransactions();
  }

  return null;
};
