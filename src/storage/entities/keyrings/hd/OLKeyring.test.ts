import { OL_ACCOUNT_MOCK, OL_SEED_MOCK } from "@src/tests/mocks/account-mocks";
import { SupportedKeyring } from "../types";
import OLKeyring from "./OLKeyring";

const ADDRESS = OL_ACCOUNT_MOCK.value!.address;

describe("OLKeyring", () => {
  it("should return address", async () => {
    const olKeyring = new OLKeyring(OL_SEED_MOCK);

    const address = await olKeyring.getAddress(OL_SEED_MOCK);
    expect(address).toBe(ADDRESS.toLocaleLowerCase());
  });

  describe("get key", () => {
    it("should return key", () => {
      const olKeyring = new OLKeyring(OL_SEED_MOCK);

      const addressMock = ADDRESS.toLocaleLowerCase();

      olKeyring.addKeyPair(addressMock, {
        path: "0",
        key: OL_SEED_MOCK,
      });
      const key = olKeyring.getKey(addressMock);
      expect(key).toBe(`${OL_SEED_MOCK}0`);
    });

    it("should throw error if key pair not found", () => {
      const olKeyring = new OLKeyring(OL_SEED_MOCK);

      const addressMock = ADDRESS.toLocaleLowerCase();

      expect(() => olKeyring.getKey(addressMock)).toThrowError(
        "Key pair not found"
      );
    });
  });

  it("should return json object", () => {
    const keyring = OLKeyring.fromJSON({
      mnemonic: OL_SEED_MOCK,
      keyPairs: {
        [ADDRESS.toLocaleLowerCase()]: {
          path: "0",
        },
      },
    } as unknown as SupportedKeyring);

    expect(keyring.mnemonic).toBe(OL_SEED_MOCK);
  });

  it("should throw error if mnemonic is invalid", () => {
    try {
      new OLKeyring("invalid mnemonic");
    } catch (error) {
      expect(String(error)).toEqual("Error: Invalid mnemonic");
    }
  });

  it("should return json object", () => {
    const olKeyring = new OLKeyring(OL_SEED_MOCK);
    const result = olKeyring.toJSON();

    expect(result).toEqual({
      mnemonic: OL_SEED_MOCK,
      keyPairs: {},
    });
  });
});
