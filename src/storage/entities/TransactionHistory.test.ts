import { AccountType } from "@src/accounts/types";
import Account from "./Account";
import TransactionHistory from "./TransactionHistory";
import { Transaction } from "@src/types";

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
});
