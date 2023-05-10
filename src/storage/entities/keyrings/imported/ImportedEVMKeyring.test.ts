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
});
