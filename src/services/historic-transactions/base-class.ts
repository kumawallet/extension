import { HistoricTransaction } from "@src/types";

export abstract class HistoricTransactionsService {
  chainId: string;
  address: string;

  constructor(chainId: string, address: string) {
    this.chainId = chainId;
    this.address = address;
  }

  abstract getHistoricTransactions: () => Promise<HistoricTransaction[]>;
}
