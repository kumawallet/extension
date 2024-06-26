import { BehaviorSubject } from "rxjs";
import Account from "./Account";
import { EVM_CHAINS, SUBSTRATE_CHAINS } from "@src/constants/chainsData";
import { OL_CHAINS } from "@src/constants/chainsData/ol";
import Activity from "./activity/Activity";
import { formatFees } from "@src/utils/assets";
import { getTxLink } from "@src/utils/transfer";
import { getChainHistoricHandler } from "@src/services/historic-transactions";
import { transformAddress } from "@src/utils/account-utils";
import {
  Chain,
  ChainType,
  FormattedTransaction,
  Transaction,
} from "@src/types";

type ChainId = string;

interface Transactions {
  [key: ChainId]: FormattedTransaction[];
}

export default class TransactionHistory {
  public transactions = new BehaviorSubject<Transactions>({});
  public account: Account | null = null;
  private networks: string[] = [];
  private allChains = [SUBSTRATE_CHAINS, EVM_CHAINS, OL_CHAINS].flat();

  async addChain({ chainId }: { chainId: string }) {
    if (!this.networks.includes(chainId)) this.networks.push(chainId);

    if (!this.account) return;

    // get chain names based on this.networks
    const chains = this.allChains
      .filter((chain) => chainId === chain.id)
      .map((chain) => ({
        name: chain.name,
        id: chain.id,
      }));

    return this.loadTransactions({ chains });
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
    originNetwork,
    targetNetwork,
  }: {
    chainId: string;
    transaction: Transaction;
    originNetwork: Chain;
    targetNetwork: Chain;
  }) {
    const transactions = this.transactions.getValue();

    if (!transactions[chainId]) transactions[chainId] = [];

    transactions[chainId]?.push({
      ...transaction,
      chainLogo: originNetwork.logo,
      fee: `${formatFees(transaction.fee, originNetwork.decimals)} ${
        originNetwork.symbol
      }`,
      link: getTxLink(originNetwork, transaction),
      isXcm: originNetwork.id !== targetNetwork.id,
    });
    this.transactions.next(transactions);
  }

  updateTransaction({
    chainId,
    id,
    status,
    fee,
  }: {
    chainId: string;
    id: string;
    status: string;
    fee?: string;
  }) {
    const transactions = this.transactions.getValue();

    this.transactions.next({
      ...transactions,
      [chainId]: transactions[chainId].map((tx) => {
        if (tx.id === id) {
          tx.status = status;
          if (fee) tx.fee = fee;
          return tx;
        }

        return tx;
      }),
    });
  }

  async loadTransactions({
    chains,
  }: {
    chains: { name: string; id: string }[];
  }) {
    if (!this.account?.value) return;

    if (!this.networks.length) return;

    const chainIds = this.networks.filter((chainId) =>
      chains.some((chain) => chain.id === chainId)
    );

    const chainTransactionsFromStorage = (await Activity.getRecords({
      address: this.account.key,
      networkNames: chains.map(({ name }) => name),
    })) as unknown as Transaction[];

    const historicTransactions = await Promise.all(
      chainIds.map((chainId) =>
        getChainHistoricHandler({
          chainId,
          address: transformAddress(
            this.account?.value!.address as string,
            this.allChains.find((chain) => chain.id === chainId)?.prefix || 0
          ),
        })
          .then((transaction) => ({
            [chainId]: transaction,
          }))
          .catch(() => {
            return {
              [chainId]: {
                transactions: [],
                hasNextPage: false,
              },
            };
          })
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

      const isSender = transaction.sender === this.account?.value?.address;
      const chain = isSender ? originChain : targetChain;
      const chainId = chain.id;

      const isXcm =
        (originChain.type === ChainType.WASM ||
          targetChain.type === ChainType.WASM) &&
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
      const chainTransaction = transaction[chainId].transactions || [];

      if (!transactionsByChainId[chainId]) {
        transactionsByChainId[chainId] = [];
      }

      const chain = this.allChains.find((chain) => chain.id === chainId);

      transactionsByChainId[chainId].push(
        ...chainTransaction.map((tx) => ({
          ...tx,
          chainLogo: chain!.logo,
          fee: `${formatFees(tx.fee, chain!.decimals)} ${chain!.symbol}`,
          link: getTxLink(chain!, tx),
          isXcm: tx.originNetwork !== tx.targetNetwork,
        }))
      );
    });

    this.transactions.next(transactionsByChainId);
  }

  getTransactions(): FormattedTransaction[] {
    const transactions = Object.values(this.transactions.getValue());

    return transactions.flat().sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
  }

  public async setAccount(account: Account | null) {
    this.account = account;

    if (!account) {
      this.transactions.next({});
      return;
    }

    const chains = this.allChains
      .filter((chain) => this.networks.includes(chain.id))
      .map((chain) => ({
        name: chain.name,
        id: chain.id,
      }));

    await this.loadTransactions({
      chains,
    });
  }
}
