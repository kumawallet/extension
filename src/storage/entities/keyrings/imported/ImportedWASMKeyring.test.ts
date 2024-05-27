import { SupportedKeyring } from "../types";
import ImportedWASMKeyring from "./ImportedWASMKeyring";

describe("ImportedWASMKeyring", () => {
  beforeAll(() => {
    vi.mock("@polkadot/ui-keyring", () => ({
      default: {
        createFromUri: vi.fn().mockReturnValue({
          address: "0x6BdD86284810AddBAA184f74B35d568087bB04eE",
        }),
      },
    }));

    vi.mock("@src/storage/Auth", () => ({
      default: {
        password: "password",
      },
    }));
  });
  it("getImportedData", async () => {
    const importEVMKeyring = new ImportedWASMKeyring();

    const importedData = await importEVMKeyring.getImportedData("seed");

    expect(importedData).toEqual({
      address: "0x6BdD86284810AddBAA184f74B35d568087bB04eE",
      keyPair: {
        key: "seed",
      },
      isDerivable: true,
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

    const importEVMKeyring = ImportedWASMKeyring.fromJSON(
      json as SupportedKeyring
    );

    expect(importEVMKeyring).toEqual({
      type: "IMPORTED_WASM",
      keyPairs: {
        "0x6BdD86284810AddBAA184f74B35d568087bB04eE": {
          key: "678a8622ff4f22f720c818fbda888006ccad760dbdf0d6b39b07110f332959a2",
        },
      },
    });
  });
});
