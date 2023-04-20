import { vi } from "vitest";
import AccountManager from "./AccountManager";
import { AccountValue } from "./types";
import Keyring from "../storage/entities/Keyring";
import { AccountKey, AccountType } from "@src/accounts/types";
import {
  accountsMocks,
  selectedEVMAccountMock,
  selectedWASMAccountMock,
} from "@src/tests/mocks/account-mocks";
import Accounts from "@src/storage/entities/Accounts";
import Vault from "@src/storage/entities/Vault";

const evmWalletResponseMock = {
  address: "0x12345",
  mnemonic: {
    phrase: "1 2 3 4 5",
  },
};

const wasmWalletResponseMock = {
  json: {
    address: "12345",
  },
  pair: {
    meta: {
      privateKey: {
        toString: () => "0x12345",
      },
    },
  },
};

const mockNewAcount = (key: AccountKey, value: AccountValue) => ({
  key,
  value,
  type: key.split("-")[0] as AccountType,
});

describe("AccountManager", () => {
  beforeAll(() => {
    vi.mock("@polkadot/ui-keyring", () => ({
      default: {
        addUri: vi.fn().mockImplementation(() => wasmWalletResponseMock),
      },
    }));

    vi.mock("ethers", () => {
      class WalletMock {
        address = "0x12345";
        mnemonic = {
          phrase: "1 2 3 4 5",
        };

        static fromMnemonic() {
          return {
            address: "0x12345",
            privateKey: "12345",
          };
        }
      }

      return {
        ethers: {
          Wallet: WalletMock,
        },
      };
    });

    vi.mock("../storage/entities/Keyring", () => {
      class mockKeyring {
        static save() {
          vi.fn();
        }
      }

      return {
        default: mockKeyring,
      };
    });
    vi.mock("../storage/entities/Vault", () => {
      class _Vault {
        static get() {
          return {};
        }
        static set() {
          return {};
        }
        async getKeyringsByType() {
          return {
            path: "",
            increaseAccountQuantity: vi.fn(),
          };
        }
      }

      return {
        default: _Vault,
      };
    });
    vi.mock("../storage/Auth", () => ({
      default: {
        password: "",
        getInstance: () => ({
          encryptBackup: () => "",
        }),
      },
    }));
    vi.mock("@src/storage/entities/BackUp", () => {
      class MockBackup {
        static set() {
          return "";
        }
      }

      return {
        default: MockBackup,
      };
    });
    vi.mock("@src/storage/entities/Account", () => ({
      default: vi
        .fn()
        .mockImplementation((key, value) => mockNewAcount(key, value)),
    }));
    vi.mock("@src/storage/entities/Accounts", () => ({
      default: {
        count: () => 0,
        add: vi.fn(),
        getAccount: vi.fn().mockImplementation(() => selectedEVMAccountMock),
        update: vi.fn().mockImplementation((account) => account),
        getAll: vi.fn().mockImplementation(() => accountsMocks),
        get: vi.fn().mockImplementation(() => {
          const data: { [key: string]: object } = {};

          accountsMocks.forEach((acc) => {
            data[acc.key] = {
              get: () => acc,
            };
          });

          return {
            data,
            get: (key: string) => accountsMocks.find((acc) => acc.key === key),
          };
        }),
      },
    }));
    vi.mock("@src/storage/entities/BaseEntity");
  });

  describe("formatAddress", () => {
    it("should format evm account", () => {
      const address = "0x123";
      const result = AccountManager["formatAddress"](address, AccountType.EVM);
      expect(result).toEqual(`${AccountType.EVM}-${address}`);
    });
    it("should return the same address", () => {
      const address = "WASM-0x123";
      const result = AccountManager["formatAddress"](address, AccountType.EVM);
      expect(result).toEqual(address);
    });
  });

  describe("getImportedEVMAddress", () => {
    it("should return address, seed and privateKey", async () => {
      const privateKey = "1234x";

      const result = await AccountManager["getImportedEVMAddress"](privateKey);

      expect(result).toHaveProperty("address", evmWalletResponseMock.address);
      expect(result).toHaveProperty("privateKey", privateKey);
      expect(result).toHaveProperty(
        "seed",
        evmWalletResponseMock.mnemonic.phrase
      );
    });
  });

  describe("getImportedWASMAddress", () => {
    it("should return address, seed and privateKey", async () => {
      const seed = "1 2 3 4 5";

      const result = await AccountManager["getImportedWASMAddress"](seed);

      expect(result).toHaveProperty(
        "address",
        wasmWalletResponseMock.json.address
      );
      expect(result).toHaveProperty(
        "privateKey",
        wasmWalletResponseMock.pair.meta.privateKey.toString()
      );
      expect(result).toHaveProperty("seed", seed);
    });
  });

  describe("addAccount", () => {
    it("should return created account", async () => {
      const newAccountForm = {
        address: "0x1234",
        type: AccountType.EVM,
        name: "",
        keyring: {
          key: `${AccountType.EVM}-0x1234`,
        },
      };

      const result = await AccountManager["addAccount"](
        newAccountForm.address,
        newAccountForm.type,
        newAccountForm.name,
        newAccountForm.keyring as Keyring
      );

      expect(result).toHaveProperty(
        "key",
        `${AccountType.EVM}-${newAccountForm.address}`
      );

      expect(result.value).toEqual({
        name: "Account 1",
        address: newAccountForm.address,
        keyring: `${AccountType.EVM}-${newAccountForm.address}`,
      });
      expect(result).toHaveProperty("type", AccountType.EVM);
    });
  });

  describe("addEVMAccount", () => {
    it("should return new account", async () => {
      const evmForm = {
        seed: "12345",
        name: "new evm account",
        path: "0/0/0",
        keyring: {
          key: `${AccountType.EVM}-0x12345`,
        },
      };
      const result = await AccountManager["addEVMAccount"](
        evmForm.seed,
        evmForm.name,
        evmForm.path,
        evmForm.keyring as Keyring
      );
      expect(result).toHaveProperty("key", `${AccountType.EVM}-0x12345`);
      expect(result.value).toEqual({
        name: evmForm.name,
        address: "0x12345",
        keyring: `${AccountType.EVM}-0x12345`,
      });
      expect(result).toHaveProperty("type", AccountType.EVM);
    });
  });

  describe("addWasmAccount", () => {
    it("should return new account", async () => {
      const wasmForm = {
        seed: "12345",
        name: "new wasm account",
        keyring: {
          key: `${AccountType.WASM}-12345`,
        },
      };
      const result = await AccountManager["addWASMAccount"](
        wasmForm.seed,
        wasmForm.name,
        wasmForm.keyring as Keyring
      );
      expect(result).toHaveProperty("key", `${AccountType.WASM}-12345`);
      expect(result.value).toEqual({
        name: wasmForm.name,
        address: wasmForm.seed,
        keyring: `${AccountType.WASM}-12345`,
      });
      expect(result).toHaveProperty("type", AccountType.WASM);
    });
  });

  describe("importAccount", () => {
    it("should add imported evm account", async () => {
      const importEVMForm = {
        name: "imported-evm",
        privateKeyOrSeed: "0x12345",
        accountType: AccountType.EVM,
      };

      const result = await AccountManager["importAccount"](importEVMForm);
      expect(result).toHaveProperty(
        "key",
        `${AccountType.IMPORTED_EVM}-0x12345`
      );
      expect(result.value).toEqual({
        name: importEVMForm.name,
        address: "0x12345",
        keyring: undefined,
      });
      expect(result).toHaveProperty("type", AccountType.IMPORTED_EVM);
    });

    it("should add imported wasm account", async () => {
      const importEVMForm = {
        name: "imported-wasm",
        privateKeyOrSeed: "0x12345",
        accountType: AccountType.WASM,
      };

      const result = await AccountManager["importAccount"](importEVMForm);
      expect(result).toHaveProperty(
        "key",
        `${AccountType.IMPORTED_WASM}-12345`
      );
      expect(result.value).toEqual({
        name: importEVMForm.name,
        address: "12345",
        keyring: undefined,
      });
      expect(result).toHaveProperty("type", AccountType.IMPORTED_WASM);
    });
  });

  describe("derive", () => {
    it("should derive wasm account", async () => {
      const mockVault = new Vault();

      const deriveForm = {
        name: "derive-evm",
        vault: mockVault,
        type: AccountType.WASM,
      };
      const result = await AccountManager["derive"](
        deriveForm.name,
        deriveForm.vault,
        deriveForm.type
      );
      expect(result).toMatchObject({
        key: `${AccountType.WASM}-12345`,
        value: {
          name: deriveForm.name,
          address: "12345",
          keyring: undefined,
        },
        type: AccountType.WASM,
      });
    });

    it("should derive evm account", async () => {
      const mockVault = new Vault();

      const deriveForm = {
        name: "derive-evm",
        vault: mockVault,
        type: AccountType.EVM,
      };
      const result = await AccountManager["derive"](
        deriveForm.name,
        deriveForm.vault,
        deriveForm.type
      );
      expect(result).toMatchObject({
        key: `${AccountType.EVM}-0x12345`,
        value: {
          name: deriveForm.name,
          address: "0x12345",
          keyring: undefined,
        },
        type: AccountType.EVM,
      });
    });
  });

  describe("getAccount", () => {
    it("should return account by key", async () => {
      const result = await AccountManager["getAccount"](
        selectedEVMAccountMock.key as AccountKey
      );
      expect(result).toMatchObject(selectedEVMAccountMock);
    });

    //Audit: typo
    it("shoud show error", async () => {
      try {
        await AccountManager["getAccount"]("" as AccountKey);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: account_key_required");
      }
    });
  });

  describe("changeName", () => {
    it("should change name", async () => {
      const key = selectedEVMAccountMock.key;
      const name = "new name";

      const result = await AccountManager["changeName"](
        key as AccountKey,
        name
      );

      expect(result).toMatchObject({
        ...selectedEVMAccountMock,
        value: {
          ...selectedEVMAccountMock.value,
          name,
        },
      });
    });

    it("should return error", async () => {
      const Accounts = await import("@src/storage/entities/Accounts");
      Accounts.default.getAccount = vi.fn().mockImplementation(() => null);

      try {
        const key = selectedEVMAccountMock.key;
        const name = "new name";

        await AccountManager["changeName"](key as AccountKey, name);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: account_not_found");
      }
    });
  });

  describe("getAll", () => {
    it("shoudl return all wasm accounts", async () => {
      const result = await AccountManager["getAll"]([AccountType.WASM]);
      expect(result?.data).toEqual({
        [selectedWASMAccountMock.key]: selectedWASMAccountMock,
      });
    });

    it("shoudl return undefined", async () => {
      const Accounts = await import("@src/storage/entities/Accounts");
      Accounts.default.get = vi.fn().mockImplementation(() => undefined);
      const result = await AccountManager["getAll"]([AccountType.WASM]);
      expect(result).toEqual(undefined);
    });
  });

  describe("areAccountsInitialized", () => {
    it("should return true", async () => {
      const accounts = {
        getAll: () => accountsMocks,
      };

      const result = await AccountManager["areAccountsInitialized"](
        accounts as Accounts
      );
      expect(result).toBe(true);
    });
  });

  describe("restorePassword", () => {
    it("should restore password", async () => {
      const get = vi.fn().mockImplementation(() => ({
        data: "encrypted_data",
      }));

      const Backup = await import("@src/storage/entities/BackUp");
      Backup.default.get = get;

      const decryptBackup = vi
        .fn()
        .mockImplementation(async () => "decrypted_password" as unknown);

      const Auth = await import("../storage/Auth");
      Auth.default.decryptBackup = decryptBackup;
      Auth.default.password = "";
      Auth.default.isUnlocked = false;

      await AccountManager["restorePassword"]("0x12345", "12345");

      expect(get).toHaveBeenCalledOnce();
      expect(decryptBackup).toHaveBeenCalledOnce();
    });
  });
});
