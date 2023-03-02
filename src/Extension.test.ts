import { AccountType, AccountKey } from "./accounts/types";
import Extension from "./Extension";
import { selectedEVMChainMock } from "./tests/mocks/chain-mocks";
import { expect } from "vitest";
import Account from "./storage/entities/Account";
import {
  selectedEVMAccountMock,
  accountsMocks,
} from "./tests/mocks/account-mocks";
const accountManageMock = {
  saveBackup: vi.fn(),
};

describe("Extension", () => {
  beforeAll(() => {
    vi.mock("./storage/Auth.ts", () => ({
      default: {
        getInstance: vi.fn().mockReturnValue({
          signUp: vi.fn(),
        }),
      },
    }));
    vi.mock("./storage/entities/Account", () => ({
      default: {},
    }));
    vi.mock("./storage/entities/Network", () => ({
      default: {},
    }));
    vi.mock("./storage/entities/SelectedAccount.ts", () => {
      class _SelectedAccount {
        static get() {
          return selectedEVMAccountMock;
        }
        static set() {
          vi.fn();
        }
        fromAccount() {
          vi.fn();
        }
      }
      return {
        default: _SelectedAccount,
      };
    });
    vi.mock("./storage/entities/CacheAuth", () => ({
      default: {
        cachePassword: vi.fn(),
        loadFromCache: vi.fn(),
      },
    }));
    vi.mock("./storage/entities/Vault.ts", () => ({
      default: {},
    }));
    vi.mock("./storage/entities/BackUp.ts", () => ({
      default: {},
    }));
    vi.mock("./storage/entities/settings/Settings", () => ({
      default: {},
    }));
    vi.mock("./storage/entities/registry/Registry", () => ({
      default: {},
    }));
    vi.mock("./storage/entities/activity/Activity", () => ({
      default: {},
    }));
    vi.mock("./storage/entities/Chains", () => ({
      default: {},
    }));
    vi.mock("./storage/entities/BaseEntity", () => {
      class BaseEntityMock {}

      return {
        default: BaseEntityMock,
      };
    });
    vi.mock("./storage/Storage.ts", () => ({
      default: {
        getInstance: vi.fn().mockReturnValue({
          init: vi.fn(),
        }),
      },
    }));
    vi.mock("./accounts/AccountManager.ts", () => ({
      default: {
        saveBackup: () => accountManageMock.saveBackup(),
        addWASMAccount: vi.fn(),
        addEVMAccount: vi.fn(),
      },
    }));
  });

  describe("init", () => {
    it("should init", async () => {
      await Extension["init"]("12345", "1 2 3 4 5", true);
      expect(accountManageMock.saveBackup).toHaveBeenCalled();
    });

    it("should throw error on init", async () => {
      const AccountMannager = await import("./accounts/AccountManager");
      AccountMannager.default.saveBackup = vi
        .fn()
        .mockRejectedValue("failed_to_save_backup");

      try {
        await Extension["init"]("12345", "1 2 3 4 5", true);
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_save_backup");
      }
    });
  });

  describe("createAccounts", () => {
    it("should create accounts", async () => {
      const AccountMannager = await import("./accounts/AccountManager");
      AccountMannager.default.saveBackup = accountManageMock.saveBackup;

      const _Auth = await import("./storage/Auth");
      _Auth.default.isUnlocked = true;

      const result = await Extension.createAccounts(
        "1 2 3 4 5",
        "name",
        "12345"
      );
      expect(result).toBe(true);
    });
    it("should throw seed_required error", async () => {
      try {
        await Extension.createAccounts("", "", "");
      } catch (error) {
        expect(String(error)).toEqual("Error: seed_required");
      }
    });

    it("should throw seed_required error", async () => {
      try {
        await Extension.createAccounts("1 2 3 4 5", "", "");
      } catch (error) {
        expect(String(error)).toEqual("Error: password_required");
      }
    });

    it("should throw failed_to_import_account", async () => {
      const AccountMannager = await import("./accounts/AccountManager");
      AccountMannager.default.saveBackup = accountManageMock.saveBackup;

      const _Auth = await import("./storage/Auth");
      _Auth.default.isUnlocked = false;

      try {
        await Extension.createAccounts("1 2 3 4 5", "name", "12345");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_create_accounts");
      }
    });
  });

  describe("importAccount", () => {
    it("should return private_key_or_seed_required error", async () => {
      try {
        await Extension.importAccount("name", "", "password", AccountType.EVM);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: private_key_or_seed_required");
      }
    });

    it("should return password_required error", async () => {
      try {
        await Extension.importAccount("name", "1 2 3 4 5", "", AccountType.EVM);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: password_required");
      }
    });

    it("should reutrn failed_to_import_account", async () => {
      const selectedAccount = vi.fn();
      const _AccountManager = await import("./accounts/AccountManager");
      _AccountManager.default.importAccount = selectedAccount;

      const _Auth = await import("./storage/Auth");
      _Auth.default.isUnlocked = true;

      await Extension.importAccount(
        "name",
        "1 2 3 4 5",
        "12345",
        AccountType.EVM
      );
      expect(selectedAccount).toHaveBeenCalled();
    });
  });

  describe("restorePassword", () => {
    it("should restore password", async () => {
      const restorePassword = vi.fn();

      const _AccountManager = await import("./accounts/AccountManager");
      _AccountManager.default.restorePassword = restorePassword;

      await Extension.restorePassword("1 2 3 4 5", "12345");
      expect(restorePassword).toHaveBeenCalled();
    });

    it("should return private_key_or_seed_required", async () => {
      try {
        await Extension.restorePassword("", "");
      } catch (error) {
        expect(String(error)).toEqual("Error: private_key_or_seed_required");
      }
    });

    it("should return private_key_or_seed_required", async () => {
      try {
        await Extension.restorePassword("1 2 3 4 5", "");
      } catch (error) {
        expect(String(error)).toEqual("Error: password_required");
      }
    });
  });

  it("should remove key", async () => {
    const remove = vi.fn();

    const _AccountManager = await import("./accounts/AccountManager");
    _AccountManager.default.remove = remove;

    Extension.removeAccount("EVM-1234");
    expect(remove).toHaveBeenCalled();
  });

  it("should change account name", async () => {
    const changeName = vi.fn();

    const _AccountManager = await import("./accounts/AccountManager");
    _AccountManager.default.changeName = changeName;

    Extension.changeAccountName("EVM-1234", "newname");

    expect(changeName).toHaveBeenCalled();
  });

  describe("sign in", () => {
    it("should sign in", async () => {
      const getEncryptedVault = vi.fn().mockReturnValue("vault");
      const cachePassword = vi.fn();

      const _Vault = await import("./storage/entities/Vault");
      _Vault.default.getEncryptedVault = getEncryptedVault;

      const _Auth = await import("./storage/Auth");
      _Auth.default.getInstance = vi.fn().mockReturnValue({
        signIn: vi.fn(),
      });

      const _CacheAuth = await import("./storage/entities/CacheAuth");
      _CacheAuth.default.cachePassword = cachePassword;

      await Extension.signIn("12345");
      expect(cachePassword).toHaveBeenCalled();
    });

    it("should return failed_to_sign_in error", async () => {
      const getEncryptedVault = vi.fn().mockReturnValue(undefined);

      const _Vault = await import("./storage/entities/Vault");
      _Vault.default.getEncryptedVault = getEncryptedVault;

      const _Auth = await import("./storage/Auth");
      _Auth.default.getInstance = vi.fn().mockReturnValue({
        signOut: vi.fn(),
      });

      try {
        await Extension.signIn("12345");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_sign_in");
      }
    });

    it("should throw error", async () => {
      const getEncryptedVault = vi.fn().mockRejectedValue(Error("vault_error"));

      const _Vault = await import("./storage/entities/Vault");
      _Vault.default.getEncryptedVault = getEncryptedVault;

      const _Auth = await import("./storage/Auth");
      _Auth.default.getInstance = vi.fn().mockReturnValue({
        signOut: vi.fn(),
      });

      try {
        await Extension.signIn("12345");
      } catch (error) {
        expect(String(error)).toEqual("Error: vault_error");
      }
    });
  });

  it("should return alreadySignedUp as true", async () => {
    const _Vault = await import("./storage/entities/Vault");
    _Vault.default.alreadySignedUp = vi.fn().mockResolvedValue(true);

    const result = await Extension.alreadySignedUp();
    expect(result).toBe(true);
  });

  describe("areAccountsInitialized", () => {
    it("should true", async () => {
      const _Accounts = await import("./storage/entities/Accounts");
      _Accounts.default.get = vi.fn().mockReturnValue({
        data: {
          "EVM-1234": {
            type: AccountType.EVM,
          },
        },
      });

      const _AccountManager = await import("./accounts/AccountManager");
      _AccountManager.default.areAccountsInitialized = vi
        .fn()
        .mockReturnValue(true);

      const result = await Extension.areAccountsInitialized();
      expect(result).toBe(true);
    });

    it("should return false", async () => {
      const _Accounts = await import("./storage/entities/Accounts");
      _Accounts.default.get = vi.fn().mockReturnValue(undefined);

      const result = await Extension.areAccountsInitialized();
      expect(result).toBe(false);
    });

    it("should return with catch error false", async () => {
      const _Accounts = await import("./storage/entities/Accounts");
      _Accounts.default.get = vi.fn().mockRejectedValue(undefined);

      try {
        await Extension.areAccountsInitialized();
      } catch (error) {
        expect(error).toBe(false);
      }
    });
  });

  it("should sign out", async () => {
    const clear = vi.fn();

    const _Auth = await import("./storage/Auth");
    _Auth.default.getInstance = vi.fn().mockReturnValue({
      signOut: vi.fn(),
    });

    const _CacheAuth = await import("./storage/entities/CacheAuth");
    _CacheAuth.default.clear = clear;

    await Extension.signOut();
    expect(clear).toHaveBeenCalled();
  });

  it("should return isUnlocked as true", async () => {
    const _Auth = await import("./storage/Auth");
    _Auth.default.isUnlocked = true;

    const _CacheAuth = await import("./storage/entities/CacheAuth");
    _CacheAuth.default.loadFromCache = vi.fn();

    const result = await Extension.isUnlocked();
    expect(result).toBe(true);
  });

  describe("showPrivateKey", () => {
    it("should return private key", async () => {
      const _SelectedAccount = await import(
        "./storage/entities/SelectedAccount"
      );
      _SelectedAccount.default.get = vi.fn().mockReturnValue({
        key: "EVM--12345",
      });

      const _Vault = await import("./storage/entities/Vault");
      _Vault.default.showPrivateKey = vi.fn().mockReturnValue("private-key");

      const result = await Extension.showPrivateKey();

      expect(result).toEqual("private-key");
    });

    it("should return undefined", async () => {
      const _SelectedAccount = await import(
        "./storage/entities/SelectedAccount"
      );
      _SelectedAccount.default.get = vi.fn().mockReturnValue(undefined);

      const result = await Extension.showPrivateKey();
      expect(result).toBe(undefined);
    });
  });

  describe("showSeed", () => {
    it("should return seed", async () => {
      const _SelectedAccount = await import(
        "./storage/entities/SelectedAccount"
      );
      _SelectedAccount.default.get = vi.fn().mockReturnValue({
        key: "EVM--12345",
      });

      const _Vault = await import("./storage/entities/Vault");
      _Vault.default.showSeed = vi.fn().mockReturnValue("seed");

      const result = await Extension.showSeed();

      expect(result).toEqual("seed");
    });

    it("should return undefined", async () => {
      const _SelectedAccount = await import(
        "./storage/entities/SelectedAccount"
      );
      _SelectedAccount.default.get = vi.fn().mockReturnValue(undefined);

      const result = await Extension.showSeed();
      expect(result).toBe(undefined);
    });
  });

  it("should return account by key", async () => {
    const _AccountManager = await import("./accounts/AccountManager");
    _AccountManager.default.getAccount = vi
      .fn()
      .mockReturnValue(selectedEVMAccountMock);

    const result = await Extension.getAccount(
      selectedEVMAccountMock.key as AccountKey
    );
    expect(result).toMatchObject(selectedEVMAccountMock);
  });

  describe("getAllAccounts", () => {
    it("should return empty array", async () => {
      const _AccountManager = await import("./accounts/AccountManager");
      _AccountManager.default.getAll = vi.fn().mockReturnValue({
        getAll: vi.fn().mockReturnValue(accountsMocks),
      });

      const result = await Extension.getAllAccounts();

      expect(result).toEqual(accountsMocks);
    });

    it("should return empty array", async () => {
      const _AccountManager = await import("./accounts/AccountManager");
      _AccountManager.default.getAll = vi.fn().mockReturnValue(undefined);

      const result = await Extension.getAllAccounts();

      expect(result).toEqual([]);
    });
  });

  describe("deriveAccount", () => {
    it("should return new account", async () => {
      const _Vault = await import("./storage/entities/Vault");
      _Vault.default.get = vi.fn().mockReturnValue("vault");

      const _AccountManager = await import("./accounts/AccountManager");
      _AccountManager.default.derive = vi
        .fn()
        .mockReturnValue(selectedEVMAccountMock);

      const result = await Extension.deriveAccount(
        "derived-evm",
        AccountType.EVM
      );
      expect(result).toMatchObject(selectedEVMAccountMock);
    });
    it("should return failed_to_derive_account error", async () => {
      const _Vault = await import("./storage/entities/Vault");
      _Vault.default.get = vi.fn().mockReturnValue(undefined);

      try {
        await Extension.deriveAccount("derived-evm", AccountType.EVM);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_derive_account");
      }
    });
  });

  describe("setNetwork", () => {
    it("should return true", async () => {
      class NetworkMock {
        private static instance: NetworkMock;

        public static getInstance() {
          if (!NetworkMock.instance) {
            NetworkMock.instance = new NetworkMock();
          }
          return NetworkMock.instance;
        }

        static get() {
          vi.fn();
        }

        static set() {
          vi.fn();
        }

        get() {
          vi.fn();
        }

        set() {
          vi.fn();
        }
      }

      const _Vault = await import("./storage/entities/Vault");
      _Vault.default.get = vi.fn().mockReturnValue("vault");

      const _Network = (await import("./storage/entities/Network")) as {
        default: object;
      };
      _Network.default = NetworkMock;

      const result = await Extension.setNetwork(selectedEVMChainMock);
      expect(result).toBe(true);
    });

    it("should return failed_to_derive_account error", async () => {
      const _Vault = await import("./storage/entities/Vault");
      _Vault.default.get = vi.fn().mockReturnValue(undefined);

      try {
        await Extension.setNetwork(selectedEVMChainMock);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_set_network");
      }
    });
  });

  it("should set new selected account", async () => {
    const set = vi.fn();
    class SelectedAccountMock {
      fromAccount() {
        vi.fn();
      }

      static set() {
        set();
      }
    }

    const _SelectedAccountMock = (await import(
      "./storage/entities/SelectedAccount"
    )) as { default: object };
    _SelectedAccountMock.default = SelectedAccountMock;

    await Extension.setSelectedAccount(selectedEVMAccountMock as Account);

    expect(set).toHaveBeenCalled();
  });

  it("should return selected account", async () => {
    const _SelectedAccountMock = await import(
      "./storage/entities/SelectedAccount"
    );
    _SelectedAccountMock.default.get = vi
      .fn()
      .mockReturnValue(selectedEVMAccountMock);

    const result = await Extension.getSelectedAccount();
    expect(result).toMatchObject(selectedEVMAccountMock);
  });

  it("should return selected network", async () => {
    const _NetowrkMock = await import("./storage/entities/Network");
    _NetowrkMock.default.get = vi.fn().mockReturnValue(selectedEVMChainMock);

    const result = await Extension.getNetwork();
    expect(result).toMatchObject(selectedEVMChainMock);
  });
});
