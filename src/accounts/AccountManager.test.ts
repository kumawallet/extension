import { vi } from "vitest";
import AccountManager from "./AccountManager";
import { AccountValue } from "./types";
import { AccountKey, AccountType } from "@src/accounts/types";
import {
  accountsMocks,
  selectedEVMAccountMock,
  selectedWASMAccountMock,
} from "@src/tests/mocks/account-mocks";
import Accounts from "@src/storage/entities/Accounts";
import { SupportedKeyring } from "@src/storage/entities/keyrings/types";
import HDKeyring from "@src/storage/entities/keyrings/hd/HDKeyring";

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
          utils: {
            isValidMnemonic: () => false,
          },
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
        static async saveKeyring() {
          return null;
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
        restorePassword: vi.fn(),
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
        save: vi.fn(),
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

  it("should get valid name", async () => {
    const result = await AccountManager["getValidName"]("");
    expect(result).toEqual("Account 1");
  });

  it("should create account", async () => {
    const result = await AccountManager.createAccount(
      selectedEVMAccountMock.value.name,
      selectedEVMAccountMock.value.address,
      AccountType.EVM,
      {
        type: "EVM-0x041fA537c4Fab3d7B91f67B358c126d37CBDa947",
      } as unknown as SupportedKeyring
    );
    expect(result).toEqual(selectedEVMAccountMock);
  });

  describe("addAccount", () => {
    it("should return created account", async () => {
      const newAccountForm = {
        address: "0x1234",
        type: AccountType.EVM,
        seed: "",
        name: "",
        keyring: {
          key: `${AccountType.EVM}-0x1234`,
          deriveKeyPair: () => "0x12345",
        },
      };

      const result = await AccountManager.addAccount(
        newAccountForm.type,
        newAccountForm.seed,
        newAccountForm.name,
        newAccountForm.keyring as unknown as HDKeyring
      );

      expect(result.value).toEqual({
        name: "Account 1",
        address: "0x12345",
        keyring: undefined,
      });
    });
  });

  describe("importAccount", () => {
    it("should add imported evm account", async () => {
      const Vault = (await import("@src/storage/entities/Vault")).default;
      const getKeyring = vi.fn().mockReturnValue({
        getImportedData: () => ({
          address: "0x123",
          keyPair: {
            key: "",
          },
        }),
        addKeyPair: vi.fn(),
      });
      Vault.getKeyring = getKeyring;

      const importEVMForm = {
        name: "imported-evm",
        privateKeyOrSeed: "0x12345",
        accountType: AccountType.IMPORTED_EVM,
      };

      const result = await AccountManager.importAccount(
        importEVMForm.name,
        importEVMForm.privateKeyOrSeed,
        AccountType.IMPORTED_EVM
      );

      expect(result.value).toEqual({
        name: importEVMForm.name,
        address: "0x123",
        keyring: undefined,
      });
    });
  });

  describe("derive", () => {
    it("should return derived account", async () => {
      const Vault = (await import("@src/storage/entities/Vault")).default;
      Vault.getKeyring = vi.fn().mockReturnValue({
        deriveKeyPair: () => "EVM-1234",
      });

      const result = await AccountManager.derive("Account", AccountType.EVM);
      expect(result).toMatchObject({
        key: `${AccountType.EVM}-1234`,
        type: AccountType.EVM,
        value: {
          name: "Account",
          address: "EVM-1234",
          keyring: undefined,
        },
      });
    });
    it("should throw error", async () => {
      const Vault = (await import("@src/storage/entities/Vault")).default;
      Vault.getKeyring = vi.fn().mockReturnValue(null);

      try {
        await AccountManager.derive("Accoun", AccountType.EVM);
      } catch (error) {
        expect(String(error)).toEqual(
          "Error: failed_to_derive_from_empty_keyring"
        );
      }
    });
  });

  describe("getAccount", () => {
    it("should return account by key", async () => {
      const result = await AccountManager.getAccount(
        selectedEVMAccountMock.key as AccountKey
      );
      expect(result).toMatchObject(selectedEVMAccountMock);
    });

    it("should show error", async () => {
      try {
        await AccountManager.getAccount("" as AccountKey);
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

  describe("saveBackup", () => {
    it("should save backup", async () => {
      const ethers = await import("ethers");
      ethers.ethers.utils.isValidMnemonic = vi.fn().mockReturnValue(true);

      const result = await AccountManager.saveBackup(
        "virus elephant skill pig fall enhance end grid tooth police invite early sketch ring match"
      );
      expect(result).toBeUndefined();
    });

    it("should throw recovery_phrase_required error", async () => {
      try {
        await AccountManager.saveBackup("");
      } catch (error) {
        expect(String(error)).toEqual("Error: recovery_phrase_required");
      }
    });

    it("should throw invalid_recovery_phrase error", async () => {
      try {
        await AccountManager.saveBackup("invalid recovery phrase");
      } catch (error) {
        expect(String(error)).toEqual("Error: invalid_recovery_phrase");
      }
    });
  });

  describe("restorePassword", () => {
    it("should restore password", async () => {
      const Backup = (await import("@src/storage/entities/BackUp")).default;
      Backup.get = vi.fn().mockReturnValue({
        data: {},
      });

      const ethers = await import("ethers");
      ethers.ethers.utils.isValidMnemonic = vi.fn().mockReturnValue(true);

      const result = await AccountManager.restorePassword(
        "recovery phrase",
        "Test.123"
      );

      expect(result).toBeUndefined();
    });
    it("should throw backup_not_found error", async () => {
      const Backup = (await import("@src/storage/entities/BackUp")).default;
      Backup.get = vi.fn().mockImplementation(() => null);

      try {
        await AccountManager.restorePassword(
          "invalid recovery phrase",
          "Test.123"
        );
      } catch (error) {
        expect(String(error)).toEqual("Error: backup_not_found");
      }
    });
  });
});
