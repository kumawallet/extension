import { SubqueryHandler } from ".";

describe("SubqueryHandler", () => {
  beforeAll(() => {
    vi.mock("graphql-request", async () => {
      const actual = await vi.importActual("graphql-request");
      return {
        ...actual,
        GraphQLClient: class {
          constructor() {}
          request() {
            return {
              transactions: {
                nodes: [
                  {
                    id: 1,
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                },
              },
            };
          }
        },
      };
    });

    global.fetch = vi.fn();
  });

  describe("instance", () => {
    it("should create an instance of SubqueryHandler", () => {
      const subqueryHandler = new SubqueryHandler(
        "polkadot",
        "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F"
      );

      expect(subqueryHandler).toBeInstanceOf(SubqueryHandler);
    });
  });

  describe("getHistoricTransactions", () => {
    it("should return an object with transactions and hasNextPage", async () => {
      const subqueryHandler = new SubqueryHandler(
        "polkadot",
        "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F"
      );

      const result = await subqueryHandler.getHistoricTransactions();

      expect(result).toEqual({
        transactions: [
          {
            id: 1,
          },
        ],
        hasNextPage: false,
      });
    });
  });
});
