import { AccountType } from "@src/accounts/types";
import Account from "./Account";
import TransactionHistory from "./TransactionHistory";
import { Transaction } from "@src/types";
import { SUBTRATE_CHAINS } from "@src/constants/chainsData";

const ACCOUNT: Account = {
  key: "WASM-5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
  value: {
    address: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
    keyring: AccountType.WASM,
    name: "asd",
  },
  type: AccountType.WASM,
};

describe("TransactionHistory", () => {
  beforeAll(() => {
    vi.mock("@polkadot/util-crypto", () => {
      const actual = vi.importActual("@polkadot/util-crypto");
      return {
        ...actual,
        encodeAddress: vi.fn((address: string) => address),
        decodeAddress: vi.fn((address: string) => address),
      };
    });

    vi.mock("./activity/Activity", () => ({
      default: {
        getRecords() {
          return [
            {
              id: "1",
              amount: "1000000000000000000",
              asset: "DOT",
              blockNumber: 1,
              fee: "1000000000000000000",
              hash: "0x123",
              status: "success",
              timestamp: 1,
              targetNetwork: "Polkadot",
              originNetwork: "Polkadot",
              sender: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
              recipient: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
              tip: "0",
              type: "transfer",
              isSwap: false,
            },
          ] as Transaction[];
        },
      },
    }));

    vi.mock("@src/services/historic-transactions", () => ({
      getChainHistoricHandler: () =>
        Promise.resolve({
          transactions: [
            {
              id: "2",
              amount: "1000000000000000000",
              asset: "DOT",
              blockNumber: 1,
              fee: "1000000000000000000",
              hash: "0x123",
              status: "success",
              timestamp: 1,
              targetNetwork: "Polkadot",
              originNetwork: "Polkadot",
              sender: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
              recipient: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
              tip: "0",
              type: "transfer",
              isSwap: false,
            },
          ],
        }),
    }));
  });

  it("addChain", async () => {
    const transactionHistory = new TransactionHistory();
    transactionHistory.account = ACCOUNT;
    await transactionHistory.addChain({ chainId: "polkadot" });

    const transactions = transactionHistory.getTransactions();

    expect(transactions[0]).toMatchObject({
      id: "1",
      amount: "1000000000000000000",
      asset: "DOT",
      blockNumber: 1,
      fee: "100000000. DOT",
      hash: "0x123",
      status: "success",
      timestamp: 1,
      targetNetwork: "Polkadot",
      originNetwork: "Polkadot",
      sender: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
      recipient: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
      tip: "0",
      type: "transfer",
      isSwap: false,
      chainLogo: "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
    });
  });

  describe("setAccount", () => {
    it("should set account", async () => {
      const transactionHistory = new TransactionHistory();
      await transactionHistory.addChain({ chainId: "polkadot" });

      await transactionHistory.setAccount(ACCOUNT);

      const transactions = transactionHistory.getTransactions();

      expect(transactions[0]).toMatchObject({
        id: "1",
        amount: "1000000000000000000",
        asset: "DOT",
        blockNumber: 1,
        fee: "100000000. DOT",
        hash: "0x123",
        status: "success",
        timestamp: 1,
        targetNetwork: "Polkadot",
        originNetwork: "Polkadot",
        sender: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
        recipient: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
        tip: "0",
        type: "transfer",
        isSwap: false,
        chainLogo:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
      });
    });

    it("should return undefined", async () => {
      const transactionHistory = new TransactionHistory();
      const result = await transactionHistory.setAccount(null);
      expect(result).toBeUndefined();
    });
  });

  describe("removeChain", () => {
    it("should remove chain", async () => {
      const transactionHistory = new TransactionHistory();
      await transactionHistory.addChain({ chainId: "polkadot" });
      await transactionHistory.removeChains({ chainIds: ["polkadot"] });

      const networks = transactionHistory["networks"];
      expect(networks).toEqual([]);
    });
  });

  describe("addTransactionToChain", () => {
    it("should add transaction to chain", async () => {
      const transactionHistory = new TransactionHistory();
      await transactionHistory.addChain({ chainId: "polkadot" });
      await transactionHistory.setAccount(ACCOUNT);

      const transaction = {
        id: "3",
        amount: "1000000000000000000",
        asset: "DOT",
        blockNumber: 1,
        fee: "1000000000000000000",
        hash: "0x123",
        status: "success",
        timestamp: 1,
        targetNetwork: "Polkadot",
        originNetwork: "Polkadot",
        sender: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
        recipient: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
        tip: "0",
        type: "transfer",
        isSwap: false,
      };

      transactionHistory.addTransactionToChain({
        chainId: "polkadot",
        transaction,
        originNetwork: SUBTRATE_CHAINS[0],
        targetNetwork: SUBTRATE_CHAINS[0],
      });

      const transactions = transactionHistory.getTransactions();

      expect(transactions.some((tx) => tx.id === "3")).toBeTruthy();
    });
  });

  describe("updateTransaction", () => {
    it("should update transaction", async () => {
      const transactionHistory = new TransactionHistory();
      await transactionHistory.addChain({ chainId: "polkadot" });
      await transactionHistory.setAccount(ACCOUNT);

      const transaction = {
        id: "3",
        amount: "1000000000000000000",
        asset: "DOT",
        blockNumber: 1,
        fee: "1000000000000000000",
        hash: "0x123",
        status: "success",
        timestamp: 1,
        targetNetwork: "Polkadot",
        originNetwork: "Polkadot",
        sender: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
        recipient: "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
        tip: "0",
        type: "transfer",
        isSwap: false,
      };

      transactionHistory.addTransactionToChain({
        chainId: "polkadot",
        transaction,
        originNetwork: SUBTRATE_CHAINS[0],
        targetNetwork: SUBTRATE_CHAINS[0],
      });

      transactionHistory.updateTransaction({
        chainId: "polkadot",
        id: "3",
        status: "pending",
      });

      const transactions = transactionHistory.getTransactions();

      expect(transactions[2].status).toBe("pending");
    });
  });
});
