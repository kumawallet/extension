import {
  POLKADOT_ACCOUNT_MOCK,
  POLKADOT_SEED_MOCK,
} from "@src/tests/mocks/account-mocks";
import { SupportedKeyring } from "../types";
import ImportedWASMKeyring from "./ImportedWASMKeyring";

describe("ImportedWASMKeyring", () => {
  beforeAll(() => {
    vi.mock("@polkadot/ui-keyring", () => ({
      default: {
        createFromUri: vi.fn().mockReturnValue({
          address: POLKADOT_ACCOUNT_MOCK.value!.address,
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
      address: POLKADOT_ACCOUNT_MOCK.value!.address,
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
        [POLKADOT_ACCOUNT_MOCK.value!.address as string]: {
          key: POLKADOT_SEED_MOCK,
        },
      },
    } as unknown;

    const importEVMKeyring = ImportedWASMKeyring.fromJSON(
      json as SupportedKeyring
    );

    expect(importEVMKeyring).toEqual({
      type: "IMPORTED_WASM",
      keyPairs: {
        [POLKADOT_ACCOUNT_MOCK.value!.address as string]: {
          key: POLKADOT_SEED_MOCK,
        },
      },
    });
  });
});
