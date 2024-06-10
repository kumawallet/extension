import {
  OL_ACCOUNT_MOCK,
  OL_PRIVATE_KEY_MOCK,
} from "@src/tests/mocks/account-mocks";
import { OlProvider } from "./OlProvider";

const functionMocks = {
  fetch: vi.fn((url: string) => {
    if (url.includes("healthy")) {
      return Promise.resolve({
        json: async () => ({
          message: "diem-node:ok",
        }),
      });
    }

    return Promise.resolve({
      json: async () => ({
        hash: "hash",
        version: 1,
        gas_used: 1,
        gas_unit_price: 100,
        success: true,
        timestamp: 1,
      }),
      status: 202,
    });
  }),
};

describe("OlProvider", () => {
  beforeAll(() => {
    vi.mock("@aptos-labs/ts-sdk", async () => {
      const actual = await import("@aptos-labs/ts-sdk");

      return {
        ...actual,
        Aptos: class {
          getAccountResource() {
            return {
              coin: {
                value: "10000",
              },
            };
          }

          getGasPriceEstimation() {
            return {
              gas_estimate: 100,
              deprioritized_gas_estimate: 1,
            };
          }

          getAccountInfo() {
            return {
              sequence_number: 1,
            };
          }

          waitForTransaction() {
            return {
              status: "executed",
              version: 1,
              gas_used: 1,
              gas_unit_price: 100,
            };
          }

          getBlockByVersion() {
            return {
              timestamp: 1,
              block_height: 1,
            };
          }
        },
      };
    });

    vi.mock("cross-fetch", () => ({
      default: (url: string) => functionMocks.fetch(url),
    }));
  });

  it("instance", () => {
    const olProvider = new OlProvider("");
    expect(olProvider).toBeDefined();
  });

  it("getBalance", async () => {
    const olProvider = new OlProvider("");
    const balance = await olProvider.getBalance("address");
    expect(balance.toString()).toBe("10000");
  });

  it("getFees", async () => {
    const olProvider = new OlProvider("");
    const fees = await olProvider.getFees();
    expect(fees.toString()).toBe("100");
  });

  it("transfer", async () => {
    const olProvider = new OlProvider("");
    const transfer = await olProvider.transfer({
      pk: OL_PRIVATE_KEY_MOCK,
      sender: OL_ACCOUNT_MOCK.value?.address as string,
      recipient: OL_ACCOUNT_MOCK.value?.address as string,
      amount: "100",
    });
    expect(transfer).toBeDefined();
  });

  it("clear interval", async () => {
    const olProvider = new OlProvider("");

    await olProvider.onNewBlock(() => {});

    await olProvider.disconnect();

    const interval = (olProvider as OlProvider)["interval"] as NodeJS.Timeout;
    expect(interval).toBe(null);
  });

  describe("healthCheck", () => {
    it("should call healthCheck", async () => {
      const olProvider = new OlProvider("");
      const healthCheck = await olProvider.healthCheck();
      expect(healthCheck).toBe(true);
    });

    it("should return false", () => {
      functionMocks.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: async () => ({
            message: "diem-node:fail",
          }),
        })
      );

      const olProvider = new OlProvider("");
      const healthCheck = olProvider.healthCheck();
      expect(healthCheck).resolves.toBe(false);
    });
  });
});
