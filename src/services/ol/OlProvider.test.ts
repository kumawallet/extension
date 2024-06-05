import { OlProvider } from "./OlProvider";

const MNEMONIC =
  "impose round lonely vast net able deer slice explain field service term ginger inside sheriff couch soul pelican alert luggage holiday nature hand nation";

const ADDRESS =
  "FDC2EF2FB05959371332B5C136CC0ED0C674F9837051D02CA1A359ED59953160";

const PRIVATE_KEY =
  "becf9b2ff05ca7376a41b901c8376a5c9e1aa92043830b2ca680072bca3be01e";

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
      pk: PRIVATE_KEY,
      sender: ADDRESS,
      recipient: ADDRESS,
      amount: "100",
    });
    expect(transfer).toBeDefined();
  });

  it("clear interval", async () => {
    const olProvider = new OlProvider("");

    await olProvider.onNewBlock(() => {});

    await olProvider.disconnect();

    const interval = (olProvider as any).interval as NodeJS.Timeout;
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
