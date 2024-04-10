import TransferRecord from "./TransferRecord";

describe("TransferRecord", () => {
  it("should be defined", () => {
    const transferRecord = new TransferRecord(
      "hash",
      "address",
      "network",
      {
        asset: {
          id: "id",
          color: "color",
        },
        symbol: "symbol",
        from: "from",
        to: "to",
        value: "value",
        gas: "gas",
        gasPrice: "gasPrice",
        fee: "fee",
      },
      "reference"
    );

    expect(transferRecord).toBeDefined();
  });
});
