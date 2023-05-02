import { AccountKey, AccountType } from "@src/accounts/types";
import { ACCOUNT_PATH } from "@src/utils/constants";
import Keyring from "./keyrings/Keyring";
import Vault from "./Vault";

const storageSet = vi.fn();
describe("Vault", () => {
  beforeAll(() => {
    vi.mock("./Accounts", () => ({
      default: {},
    }));
    vi.mock("./Account", () => ({
      default: {},
    }));
    vi.mock("../Auth.ts", () => ({
      default: {
        getInstance: () => ({
          encryptVault: () => "encrypted",
        }),
      },
    }));
    vi.mock("./CacheAuth", () => ({
      default: {},
    }));
    vi.mock("./BackUp", () => ({
      default: {},
    }));
    vi.mock("./settings/Settings", () => ({
      default: {},
    }));
    vi.mock("./registry/Registry", () => ({
      default: {},
    }));
    vi.mock("./activity/Activity", () => ({
      default: {},
    }));
    vi.mock("./Chains", () => ({
      default: {},
    }));
    vi.mock("./BaseEntity", () => {
      class baseEntityMock {
        static get() {
          return "";
        }
        static set() {
          (() => storageSet())();
          return "";
        }

        static fromData() {
          return {};
        }
        static getDefaultValue() {
          return undefined;
        }
      }
      return {
        default: baseEntityMock,
      };
    });

    vi.mock("./Keyring", () => {
      class keyringMock {
        key: AccountKey;
        type: AccountType;
        seed: string;
        path: string;
        privateKey: string;
        accountQuantity: number;

        constructor(
          key: AccountKey,
          type: AccountType,
          seed: string,
          privateKey: string,
          accountQuantity?: number
        ) {
          this.key = key;
          this.accountQuantity = accountQuantity || 1;
          this.path = type == AccountType.EVM ? ACCOUNT_PATH : seed;
          this.seed = seed;
          this.type = type;
          this.privateKey = privateKey;
        }
      }
      return {
        default: keyringMock,
      };
    });
  });

  it("should init", async () => {
    await Vault.init();
    expect(storageSet).toBeCalled();
  });

  describe("alreadySignedUp", () => {
    it("should return true", async () => {
      const Storage = await import("../Storage");
      Storage.default.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => ({
            Vault: {},
          }),
        },
      }));

      const result = await Vault.alreadySignedUp();
      expect(result).toMatchObject({});
    });

    it("should return undefined", async () => {
      const Storage = await import("../Storage");
      Storage.default.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => ({}),
        },
      }));

      const result = await Vault.alreadySignedUp();
      expect(result).toBe(undefined);
    });
  });

  describe("getEncryptedVault", () => {
    it("should return stored", async () => {
      const Storage = await import("../Storage");
      Storage.default.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => ({
            Vault: {},
          }),
        },
      }));

      const result = await Vault.getEncryptedVault();
      expect(result).toMatchObject({});
    });

    it("should return undefined", async () => {
      const Storage = await import("../Storage");
      Storage.default.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => ({}),
        },
      }));

      const result = await Vault.getEncryptedVault();
      expect(result).toBe(undefined);
    });
  });

  describe("get", () => {
    it("should return default vault", async () => {
      const Storage = await import("../Storage");
      Storage.default.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => undefined,
        },
      }));
      try {
        await Vault.getInstance();
        throw new Error("test failed");
      } catch (error) {
        expect(String(error)).toEqual("Error: vault_not_found");
      }
    });

    it("should return invalid_credentials", async () => {
      const Storage = await import("../Storage");
      Storage.default.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => ({
            Vault: {},
          }),
        },
      }));

      const Auth = await import("../Auth");
      Auth.default.getInstance = vi.fn().mockReturnValue({
        decryptVault: () => undefined,
      });

      try {
        await Vault.getInstance();
        throw new Error("test failed");
      } catch (error) {
        expect(String(error)).toEqual("Error: vault_not_found");
      }
    });
  });

  it("should return stored vault", async () => {
    const Storage = await import("../Storage");
    Storage.default.getInstance = vi.fn().mockImplementation(() => ({
      storage: {
        get: () => ({
          Vault: {
            keyrings: {
              EVM: undefined,
              WASM: undefined,
              IMPORTED_EVM: undefined,
              IMPORTED_WASM: undefined,
            },
          },
        }),
      },
    }));

    const Auth = await import("../Auth");
    Auth.default.getInstance = vi.fn().mockReturnValue({
      decryptVault: () => "decrypted",
    });

    const result = await Vault.getInstance();
    expect(result).toMatchObject({});
  });

  it("set", async () => {
    const Auth = await import("../Auth");
    Auth.default.getInstance = vi.fn().mockImplementation(() => ({
      encryptVault: vi.fn().mockImplementation(() => ""),
    }));

    await Vault.set({
      keyrings: {
        EVM: undefined,
        WASM: undefined,
        IMPORTED_EVM: undefined,
        IMPORTED_WASM: undefined,
      },
    } as Vault);
    expect(storageSet).toHaveBeenCalled();
  });

  it("should return isEmpty as true", async () => {
    const vault = await Vault.getInstance();
    const result = vault.isEmpty();
    expect(result).toBe(true);
  });

  it("should add new Keyring", () => {
    const newKeyring = {
      key: "EVM-123" as AccountKey,
      type: AccountType.EVM,
      seed: "1 2 3 4 5",
      path: "0/0/0",
      privateKey: "12345",
      accountQuantity: 1,
    };

    const vault = new Vault();
    vault.addKeyring(newKeyring as Keyring);
    const result = vault.getKeyring(newKeyring.key);
    expect(result).toMatchObject(newKeyring);
  });

  it("should update keyring", () => {
    const newKeyring = {
      key: "EVM-123" as AccountKey,
      type: AccountType.EVM,
      seed: "1 2 3 4 5",
      path: "0/0/0",
      privateKey: "12345",
      accountQuantity: 1,
    };

    const vault = new Vault();
    vault.addKeyring(newKeyring as Keyring);
    vault.updateKeyring(newKeyring.key, {
      ...newKeyring,
      path: "123",
    } as Keyring);
    const result = vault.getKeyring(newKeyring.key);
    expect(result).toMatchObject({ ...newKeyring, path: "123" });
  });

  it("should delete Keyring", () => {
    const newKeyring = {
      key: "EVM-123" as AccountKey,
      type: AccountType.EVM,
      seed: "1 2 3 4 5",
      path: "0/0/0",
      privateKey: "12345",
      accountQuantity: 1,
    };

    const vault = new Vault();
    vault.addKeyring(newKeyring as Keyring);
    vault.removeKeyring(newKeyring.key);
    const result = vault.getKeyring(newKeyring.key);
    expect(result).toBe(undefined);
  });

  it("should set keyring", () => {
    const newKeyring = {
      key: "EVM-123" as AccountKey,
      type: AccountType.EVM,
      seed: "1 2 3 4 5",
      path: "0/0/0",
      privateKey: "12345",
      accountQuantity: 1,
    };

    const vault = new Vault();
    vault.setKeyrings({
      [newKeyring.key]: newKeyring,
    } as { [key: string]: Keyring });
    const result = vault.getKeyring(newKeyring.key);
    expect(result).toMatchObject(newKeyring);
  });

  it("should get all keyrings", async () => {
    const newKeyring = {
      key: "EVM-123" as AccountKey,
      type: AccountType.EVM,
      seed: "1 2 3 4 5",
      path: ACCOUNT_PATH,
      privateKey: "12345",
      accountQuantity: 1,
    };

    const vault = new Vault();
    vault.setKeyrings({
      [newKeyring.key]: newKeyring,
    } as { [key: string]: Keyring });

    const result = await vault.getAll();
    expect(result).toEqual([newKeyring]);
  });

  it("should get keyrings by type", async () => {
    const newKeyring = {
      key: "EVM-123" as AccountKey,
      type: AccountType.EVM,
      seed: "1 2 3 4 5",
      path: ACCOUNT_PATH,
      privateKey: "12345",
      accountQuantity: 1,
    };

    const vault = new Vault();
    vault.setKeyrings({
      [newKeyring.key]: newKeyring,
    } as { [key: string]: Keyring });

    const result = await vault.getKeyringsByType(AccountType.EVM);
    expect(result).toEqual(newKeyring);
  });

  it("should return true for existing keyring", () => {
    const newKeyring = {
      key: "EVM-123" as AccountKey,
      type: AccountType.EVM,
      seed: "1 2 3 4 5",
      path: "0/0/0",
      privateKey: "12345",
      accountQuantity: 1,
    };

    const vault = new Vault();
    vault.addKeyring(newKeyring as Keyring);
    const result = vault.alreadyExists(newKeyring.key);
    expect(result).toBe(true);
  });
});
