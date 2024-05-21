import { BehaviorSubject } from "rxjs";
import Account from "./Account";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";
import { OL_CHAINS } from "@src/constants/chainsData/ol";
import Activity from "./activity/Activity";
import { formatFees } from "@src/utils/assets";
import { getTxLink } from "@src/utils/transfer";
import { getChainHistoricHandler } from "@src/services/historic-transactions";
import { transformAddress } from "@src/utils/account-utils";
import { Transaction } from "@src/types";

type ChainId = string;

interface Transactions {
  [key: ChainId]: Transaction[];
}

export default class TransactionHistory {
  public transactions = new BehaviorSubject<Transactions>({});
  public account: Account | null = null;
  private networks: string[] = [];
  private allChains = [SUBTRATE_CHAINS, EVM_CHAINS, OL_CHAINS].flat();

  async addChain({ chainId }: { chainId: string }) {
    if (!this.networks.includes(chainId)) this.networks.push(chainId);

    if (!this.account) return;

    // get chain names based on this.networks
    const chainNames = this.allChains
      .filter((chain) => chainId === chain.id)
      .map((chain) => chain.name);

    this.loadTransactions({ chainNames });
  }

  removeChains({ chainIds }: { chainIds: string[] }) {
    this.networks = this.networks.filter((id) => !chainIds.includes(id));

    const transactions = this.transactions.getValue();

    chainIds.forEach((chainId) => {
      delete transactions[chainId];
    });

    this.transactions.next(transactions);
  }

  addTransactionToChain({
    chainId,
    transaction,
  }: {
    chainId: string;
    transaction: Transaction;
  }) {
    const transactions = this.transactions.getValue();
    transactions[chainId].push(transaction);
    this.transactions.next(transactions);
  }

  async loadTransactions({ chainNames }: { chainNames: string[] }) {
    if (!this.account?.value) return;

    if (!this.networks.length) return;

    const chainIds = this.networks.filter((chainId) =>
      chainNames.includes(chainId)
    );

    const chainTransactionsFromStorage = (await Activity.getRecords({
      address: this.account.key,
      networkNames: chainNames,
    })) as unknown as Transaction[];

    const historicTransactions = await Promise.all(
      chainIds.map((chainId) =>
        getChainHistoricHandler({
          chainId,
          address: transformAddress(
            this.account?.value.address as string,
            this.allChains.find((chain) => chain.id === chainId)?.prefix || 0
          ),
        }).then((transaction) => ({
          [chainId]: transaction,
        }))
      )
    );

    const transactionsByChainId = {} as Transactions;

    chainTransactionsFromStorage.forEach((transaction) => {
      const originNetworkName = transaction.originNetwork;
      const targetNetworkName = transaction.targetNetwork;

      const originChain = this.allChains.find(
        (chain) => chain.name === originNetworkName
      );
      const targetChain = this.allChains.find(
        (chain) => chain.name === targetNetworkName
      );

      if (!originChain || !targetChain) return;

      if (!transactionsByChainId[originChain.id]) {
        transactionsByChainId[originChain.id] = [];
      }

      if (!transactionsByChainId[targetChain.id]) {
        transactionsByChainId[targetChain.id] = [];
      }

      const isSender = transaction.sender === this.account?.value.address;
      const chain = isSender ? originChain : targetChain;
      const chainId = chain.id;

      const isXcm =
        (originChain.type === "wasm" || targetChain.type === "wasm") &&
        originChain.id !== targetChain.id;

      const formatettedTx = {
        ...transaction,
        chainLogo: chain.logo,
        fee: `${formatFees(transaction.fee, chain.decimals)} ${chain.symbol}`,
        link: getTxLink(chain, transaction),
        isXcm,
      };

      transactionsByChainId[chainId].push(formatettedTx);
    });

    historicTransactions.forEach((transaction) => {
      const chainId = Object.keys(transaction)[0];
      const chainTransaction = transaction[chainId].transactions;

      if (!transactionsByChainId[chainId]) {
        transactionsByChainId[chainId] = [];
      }

      const chain = this.allChains.find((chain) => chain.id === chainId);

      transactionsByChainId[chainId].push(
        ...chainTransaction.map((tx) => ({
          ...tx,
          chainLogo: chain!.logo,
          fee: `${formatFees(tx.fee, chain!.decimals)} ${chain!.symbol}`,
          link: getTxLink(chain!, transaction),
          isXcm: tx.originNetwork !== tx.targetNetwork,
        }))
      );
    });

    const transactions = this.transactions.getValue();

    chainIds.forEach((chainId) => {
      transactions[chainId] = transactionsByChainId[chainId];
    });

    this.transactions.next(transactionsByChainId);
  }

  getTransactions() {
    const transactions = Object.values(this.transactions.getValue());

    return transactions.flat().sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
  }

  async setAccount(account: Account) {
    this.account = account;

    const chainNames = this.allChains
      .filter((chain) => this.networks.includes(chain.id))
      .map((chain) => chain.name);

    await this.loadTransactions({
      chainNames,
    });
  }
}
