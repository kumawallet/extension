import ImportedEVMKeyring from "./ImportedEVMKeyring";
import { SupportedKeyring } from "../types";

// generateRandom private key
const privateKey =
  "678a8622ff4f22f720c818fbda888006ccad760dbdf0d6b39b07110f332959a2";

describe("ImportedEVMKeyring", () => {
  it("getImportedData", async () => {
    const importEVMKeyring = new ImportedEVMKeyring();

    const importedData = await importEVMKeyring.getImportedData(privateKey);

    expect(importedData).toEqual({
      address: "0x6BdD86284810AddBAA184f74B35d568087bB04eE",
      keyPair: {
        key: "678a8622ff4f22f720c818fbda888006ccad760dbdf0d6b39b07110f332959a2",
      },
    });
  });

  it("fromJSON", () => {
    const json = {
      type: "IMPORTED_EVM",
      keyPairs: {
        "0x6BdD86284810AddBAA184f74B35d568087bB04eE": {
          key: "678a8622ff4f22f720c818fbda888006ccad760dbdf0d6b39b07110f332959a2",
        },
      },
    } as unknown;

    const importEVMKeyring = ImportedEVMKeyring.fromJSON(
      json as SupportedKeyring
    );

    expect(importEVMKeyring).toEqual({
      type: "IMPORTED_EVM",
      keyPairs: {
        "0x6BdD86284810AddBAA184f74B35d568087bB04eE": {
          key: "678a8622ff4f22f720c818fbda888006ccad760dbdf0d6b39b07110f332959a2",
        },
      },
    });
  });

  describe("getKey", () => {
    it("should return key", () => {
      const importEVMKeyring = new ImportedEVMKeyring();
      importEVMKeyring.addKeyPair(
        "0x6BdD86284810AddBAA184f74B35d568087bB04eE",
        {
          key: "678a8622ff4f22f720c818fbda888006ccad760dbdf0d6b39b07110f332959a2",
        }
      );

      const key = importEVMKeyring.getKey(
        "0x6BdD86284810AddBAA184f74B35d568087bB04eE"
      );

      expect(key).toEqual(
        "678a8622ff4f22f720c818fbda888006ccad760dbdf0d6b39b07110f332959a2"
      );
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
