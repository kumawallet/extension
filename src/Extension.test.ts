import Extension from "./Extension";
import { selectedEVMAccountMock } from "./tests/mocks/account-mocks";
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

    it("should init", async () => {
      const AccountMannager = await import("./accounts/AccountManager");
      AccountMannager.default.saveBackup = vi
        .fn()
        .mockRejectedValue("save_to_save_backup");

      try {
        await Extension["init"]("12345", "1 2 3 4 5", true);
      } catch (error) {
        expect(String(error)).toEqual("Error: save_to_save_backup");
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
});
