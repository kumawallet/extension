import {
  OL_ACCOUNT_MOCK,
  OL_PRIVATE_KEY_MOCK,
  OL_SEED_MOCK,
} from "@src/tests/mocks/account-mocks";
import { SupportedKeyring } from "../types";
import ImportedOLKeyring from "./ImportedOLKeyring";

const ADDRESS = OL_ACCOUNT_MOCK.value!.address;

describe("ImportedOLKeyring", () => {
  describe("getImportedData", async () => {
    it("should import from OL_SEED_MOCK", async () => {
      const importOLKeyring = new ImportedOLKeyring();

      const importedData = await importOLKeyring.getImportedData(OL_SEED_MOCK);

      expect(importedData.address).toEqual(ADDRESS.toLowerCase());
    });

    it("should return from private key", async () => {
      const importOLKeyring = new ImportedOLKeyring();

      const importedData = await importOLKeyring.getImportedData(
        OL_PRIVATE_KEY_MOCK
      );

      expect(importedData.address).toEqual(ADDRESS.toLowerCase());
    });
  });

  it("fromJSON", () => {
    const json = {
      type: "IMPORTED_OL",
      keyPairs: {
        [ADDRESS]: {
          key: OL_SEED_MOCK,
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
          key: OL_SEED_MOCK,
        },
      },
    });
  });

  describe("getKey", () => {
    it("should return key", () => {
      const importOLKeyring = new ImportedOLKeyring();
      importOLKeyring.addKeyPair(ADDRESS, {
        key: OL_SEED_MOCK,
      });

      const key = importOLKeyring.getKey(ADDRESS);

      expect(key).toEqual(OL_SEED_MOCK);
    });
  });
});
