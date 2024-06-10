import ImportedEVMKeyring from "./ImportedEVMKeyring";
import { SupportedKeyring } from "../types";
import {
  EVM_ACCOUNT_MOCK,
  EVM_PRIVATE_KEY_MOCK,
} from "@src/tests/mocks/account-mocks";

describe("ImportedEVMKeyring", () => {
  it("getImportedData", async () => {
    const importEVMKeyring = new ImportedEVMKeyring();

    const importedData = await importEVMKeyring.getImportedData(
      EVM_PRIVATE_KEY_MOCK
    );

    expect(importedData.address).toMatchObject(EVM_ACCOUNT_MOCK.value!.address);
  });

  it("fromJSON", () => {
    const json = {
      type: "IMPORTED_EVM",
      keyPairs: {
        [EVM_ACCOUNT_MOCK.value?.address as string]: {
          key: EVM_PRIVATE_KEY_MOCK,
        },
      },
    } as unknown;

    const importEVMKeyring = ImportedEVMKeyring.fromJSON(
      json as SupportedKeyring
    );

    expect(importEVMKeyring).toEqual({
      type: "IMPORTED_EVM",
      keyPairs: {
        [EVM_ACCOUNT_MOCK.value?.address as string]: {
          key: EVM_PRIVATE_KEY_MOCK,
        },
      },
    });
  });

  describe("getKey", () => {
    it("should return key", () => {
      const importEVMKeyring = new ImportedEVMKeyring();
      importEVMKeyring.addKeyPair(EVM_ACCOUNT_MOCK.value?.address as string, {
        key: EVM_PRIVATE_KEY_MOCK,
      });

      const key = importEVMKeyring.getKey(
        EVM_ACCOUNT_MOCK.value?.address as string
      );

      expect(key).toEqual(EVM_PRIVATE_KEY_MOCK);
    });

    it("should throw error", () => {
      const importEVMKeyring = new ImportedEVMKeyring();

      try {
        importEVMKeyring.getKey("invalid key");
      } catch (error) {
        expect(String(error)).toEqual("Error: Key pair not found");
      }
    });
  });
});
