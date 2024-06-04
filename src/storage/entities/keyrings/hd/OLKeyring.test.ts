import { SupportedKeyring } from "../types";
import OLKeyring from "./OLKeyring";

const MNEMONIC =
  "impose round lonely vast net able deer slice explain field service term ginger inside sheriff couch soul pelican alert luggage holiday nature hand nation";

const ADDRESS =
  "FDC2EF2FB05959371332B5C136CC0ED0C674F9837051D02CA1A359ED59953160";

describe("OLKeyring", () => {
  it("should return address", async () => {
    const olKeyring = new OLKeyring(MNEMONIC);

    const address = await olKeyring.getAddress(MNEMONIC);
    expect(address).toBe(ADDRESS.toLocaleLowerCase());
  });

  describe("get key", () => {
    it("should return key", () => {
      const olKeyring = new OLKeyring(MNEMONIC);

      const addressMock = ADDRESS.toLocaleLowerCase();

      olKeyring.addKeyPair(addressMock, {
        path: "0",
        key: MNEMONIC,
      });
      const key = olKeyring.getKey(addressMock);
      expect(key).toBe(`${MNEMONIC}0`);
    });

    it("should throw error if key pair not found", () => {
      const olKeyring = new OLKeyring(MNEMONIC);

      const addressMock = ADDRESS.toLocaleLowerCase();

      expect(() => olKeyring.getKey(addressMock)).toThrowError(
        "Key pair not found"
      );
    });
  });

  it("should return json object", () => {
    const keyring = OLKeyring.fromJSON({
      mnemonic: MNEMONIC,
      keyPairs: {
        [ADDRESS.toLocaleLowerCase()]: {
          path: "0",
        },
      },
    } as unknown as SupportedKeyring);

    expect(keyring.mnemonic).toBe(MNEMONIC);
  });

  it("should throw error if mnemonic is invalid", () => {
    try {
      new OLKeyring("invalid mnemonic");
    } catch (error) {
      expect(String(error)).toEqual("Error: Invalid mnemonic");
    }
  });

  it("should return json object", () => {
    const olKeyring = new OLKeyring(MNEMONIC);
    const result = olKeyring.toJSON();

    expect(result).toEqual({
      mnemonic: MNEMONIC,
      keyPairs: {},
    });
  });
});
