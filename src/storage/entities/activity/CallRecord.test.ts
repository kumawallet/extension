import CallRecord from "./CallRecord";

describe("CallRecord", () => {
  it("should be defined", () => {
    const callRecord = new CallRecord(
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
        data: "data",
        fee: "fee",
      },
      "reference"
    );

    expect(callRecord).toBeDefined();
  });
});
