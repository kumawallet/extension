import { AccountKey } from "@src/accounts/types";
import Account from "./Account";

describe("Account", () => {
  it("sholuld instance", () => {
    const key = "EVM-123" as AccountKey;
    const value = {
      name: "derived evm",
      adress: "0x12345",
      keyring: "EVM-123" as AccountKey,
    } as any;

    const account = new Account(key, value);
    expect(account).toMatchObject({
      key: key,
      value: value,
      type: "EVM",
    });
  });
});
