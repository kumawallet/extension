import { GraphQLClient } from "graphql-request";
import { HistoricTransactionsService } from "../base-class";
import { SUBQUERY_CHAINS } from "./subquery-chains";
import { HistoricTransaction, Transaction } from "@src/types";
import { subQueryQueries } from "./queries";

export class SubqueryHandler extends HistoricTransactionsService {
  private provider: GraphQLClient | undefined;
  private offset = 0;
  private limit = 20;
  private hasNextPage = true;

  constructor(chainId: string, address: string) {
    super(chainId, address);

    const endpoint = SUBQUERY_CHAINS[chainId];

    console.log("fetch", fetch);

    if (endpoint) {
      this.provider = new GraphQLClient(endpoint, {
        cache: "default",
        fetch: fetch,
      });
    }
  }

  getHistoricTransactions = async (): Promise<HistoricTransaction> => {
    try {
      if (!this.provider || !this.hasNextPage) {
        return {
          transactions: [],
          hasNextPage: false,
        };
      }

      const result = await this.provider.request<{
        transactions: {
          nodes: Transaction[];
          pageInfo: {
            hasNextPage: boolean;
          };
        };
      }>(subQueryQueries.getWalletTransactions(this.address));

      const { hasNextPage } = result.transactions.pageInfo;
      this.hasNextPage = hasNextPage;

      this.offset += this.limit;

      const transactions = result.transactions.nodes || [];

      return {
        transactions,
        hasNextPage,
      };
    } catch (error) {
      return {
        transactions: [],
        hasNextPage: false,
      };
    }
  };
}
