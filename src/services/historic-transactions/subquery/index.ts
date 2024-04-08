import { GraphQLClient } from "graphql-request";
import { HistoricTransactionsService } from "../base-class";
import { SUBQUERY_CHAINS } from "./subquery-chains";
import { HistoricTransaction } from "@src/types";
import { subQueryQueries } from "./queries";

export class SubqueryHandler extends HistoricTransactionsService {
  private provider: GraphQLClient;

  constructor(chainId: string, address: string) {
    super(chainId, address);

    const endpoint = SUBQUERY_CHAINS[chainId];

    this.provider = new GraphQLClient(endpoint, {
      cache: "default",
      fetch: fetch,
    });
  }

  getHistoricTransactions = async (): Promise<HistoricTransaction[]> => {
    try {
      const result = await this.provider.request<{
        transactions: {
          nodes: HistoricTransaction[];
        };
      }>(subQueryQueries.getWalletTransactions(this.address));

      return result?.transactions.nodes || [];
    } catch (error) {
      return [];
    }
  };
}
