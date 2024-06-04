import { SupportedKeyring } from "../types";
import ImportedOLKeyring from "./ImportedOLKeyring";

const MNEMONIC =
  "impose round lonely vast net able deer slice explain field service term ginger inside sheriff couch soul pelican alert luggage holiday nature hand nation";

const ADDRESS =
  "FDC2EF2FB05959371332B5C136CC0ED0C674F9837051D02CA1A359ED59953160";

const PRIVATE_KEY =
  "0xbecf9b2ff05ca7376a41b901c8376a5c9e1aa92043830b2ca680072bca3be01e";

describe("ImportedOLKeyring", () => {
  describe("getImportedData", async () => {
    it("should import from mnemonic", async () => {
      const importOLKeyring = new ImportedOLKeyring();

      const importedData = await importOLKeyring.getImportedData(MNEMONIC);

      expect(importedData.address).toEqual(ADDRESS.toLowerCase());
    });

    it("should return from private key", async () => {
      const importOLKeyring = new ImportedOLKeyring();

      const importedData = await importOLKeyring.getImportedData(PRIVATE_KEY);

      expect(importedData.address).toEqual(ADDRESS.toLowerCase());
    });
  });

  it("fromJSON", () => {
    const json = {
      type: "IMPORTED_OL",
      keyPairs: {
        [ADDRESS]: {
          key: MNEMONIC,
        },
      },
    } as unknown;

    const importOLKeyring = ImportedOLKeyring.fromJSON(
      json as SupportedKeyring
    );

    expect(importOLKeyring).toEqual({
      type: "IMPORTED_OL",
      keyPairs: {
        [ADDRESS]: {
          key: MNEMONIC,
        },
      },
    });
  });

  describe("getKey", () => {
    it("should return key", () => {
      const importOLKeyring = new ImportedOLKeyring();
      importOLKeyring.addKeyPair(ADDRESS, {
        key: MNEMONIC,
      });

      const key = importOLKeyring.getKey(ADDRESS);

      expect(key).toEqual(MNEMONIC);
    });
  });
});
