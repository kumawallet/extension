import { AccountType } from "@src/accounts/types";
import Vault from "./Vault";
import { SupportedKeyring } from "./keyrings/types";

const storageSet = vi.fn();

describe("Vault", () => {
  beforeAll(async () => {
    vi.mock("../Storage");
    vi.mock("../Auth");
    vi.mock("./keyrings/hd/EVMKeyring", () => {
      class mockKeyriginClass {
        constructor() {
          return {
            name: "EVM-keyring",
          };
        }

        static fromJSON(keyring: SupportedKeyring) {
          return keyring;
        }
      }

      return {
        default: mockKeyriginClass,
      };
    });

    vi.mock("./keyrings/hd/WASMKeyring", () => {
      class mockKeyriginClass {
        constructor() {
          return {
            name: "WASM-keyring",
          };
        }

        static fromJSON(keyring: SupportedKeyring) {
          return keyring;
        }
      }

      return {
        default: mockKeyriginClass,
      };
    });

    vi.mock("./keyrings/imported/ImportedEVMKeyring", () => {
      class mockKeyriginClass {
        static fromJSON(keyring: SupportedKeyring) {
          return keyring;
        }
      }
      return {
        default: mockKeyriginClass,
      };
    });
    vi.mock("./keyrings/imported/ImportedWASMKeyring", () => {
      class mockKeyriginClass {
        static fromJSON(keyring: SupportedKeyring) {
          return keyring;
        }
      }
      return {
        default: mockKeyriginClass,
      };
    });

    const Auth = (await import("../Auth")).default;

    const encryptVault = vi.fn();
    Auth.getInstance = vi.fn().mockImplementation(() => ({
      encryptVault,
    }));
  });

  describe("init", () => {
    it("should init keyrings", async () => {
      const Storage = (await import("../Storage")).default;

      Storage.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => ({
            Vault: "encripted",
          }),
          set: storageSet,
        },
      }));

      const Auth = (await import("../Auth")).default;

      const encryptVault = vi.fn();
      const decryptVault = vi.fn().mockReturnValue({
        keyrings: {
          [AccountType.EVM]: {
            name: "EVM-keyring",
            mnemonic: "evm-mnemonic",
          },
          [AccountType.WASM]: {
            name: "WASM-keyring",
            mnemonic: "wasm-mnemonic",
          },
          [AccountType.IMPORTED_EVM]: {
            name: "IMPORTED_EVM-keyring",
            mnemonic: "imported-evm-mnemonic",
          },
          [AccountType.IMPORTED_WASM]: {
            name: "IMPORTED_WASM-keyring",
            mnemonic: "imported-wasm-mnemonic",
          },
        },
      });
      Auth.getInstance = vi.fn().mockImplementation(() => ({
        encryptVault,
        decryptVault,
      }));

      const vault = await Vault.getInstance();
      expect(vault.keyrings[AccountType.EVM]).toBeDefined();
      expect(vault.keyrings[AccountType.WASM]).toBeDefined();
      expect(vault.keyrings[AccountType.IMPORTED_EVM]).toBeDefined();
      expect(vault.keyrings[AccountType.IMPORTED_WASM]).toBeDefined();
    });

    it("should throw vault_not_found error by Storage error", async () => {
      const Storage = (await import("../Storage")).default;

      Storage.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => ({}),
          set: storageSet,
        },
      }));

      try {
        await Vault.init();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toBe("Error: vault_not_found");
      }
    });

    it("should throw vault_not_found error by Auth error", async () => {
      const Storage = (await import("../Storage")).default;

      Storage.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => ({
            Vault: "encripted",
          }),
          set: storageSet,
        },
      }));

      const Auth = (await import("../Auth")).default;

      const encryptVault = vi.fn();
      const decryptVault = vi.fn().mockReturnValue(null);
      Auth.getInstance = vi.fn().mockImplementation(() => ({
        encryptVault,
        decryptVault,
      }));

      try {
        await Vault.init();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toBe("Error: vault_not_found");
      }
    });
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
      expect(result).toMatchObject(true);
    });

    it("should return false", async () => {
      const Storage = await import("../Storage");
      Storage.default.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => ({}),
        },
      }));

      const result = await Vault.alreadySignedUp();
      expect(result).toBe(false);
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

  it("set", async () => {
    const Auth = await import("../Auth");
    Auth.default.getInstance = vi.fn().mockImplementation(() => ({
      encryptVault: vi.fn().mockImplementation(() => ""),
    }));

    const Storage = await import("../Storage");
    Storage.default.getInstance = vi.fn().mockImplementation(() => ({
      storage: {
        set: () => ({}),
      },
    }));

    const Vault = (await import("./Vault")).default;

    const getFromStorage = vi.fn();
    Vault["getFromStorage"] = getFromStorage;

    await Vault.set({
      keyrings: {
        EVM: undefined,
        WASM: undefined,
        IMPORTED_EVM: undefined,
        IMPORTED_WASM: undefined,
      },
    } as Vault);
    expect(getFromStorage).toHaveBeenCalled();
  });

  it("should save keyring", async () => {
    const Vault = (await import("./Vault")).default;
    const set = vi.fn();

    Vault.getInstance = vi.fn().mockImplementation(() => ({
      keyrings: {
        EVM: undefined,
        WASM: undefined,
        IMPORTED_EVM: undefined,
        IMPORTED_WASM: undefined,
      },
    }));

    Vault.set = set;

    await Vault.saveKeyring({} as SupportedKeyring);
    expect(set).toHaveBeenCalled();
  });

  describe("getKeyring", () => {
    it("should return keyring", async () => {
      const Vault = (await import("./Vault")).default;

      Vault.getInstance = vi.fn().mockImplementation(() => ({
        keyrings: {
          EVM: undefined,
          WASM: undefined,
          IMPORTED_EVM: undefined,
          IMPORTED_WASM: undefined,
        },
        getKeyring: () => ({
          type: AccountType.EVM,
        }),
      }));

      const result = await Vault.getKeyring(AccountType.EVM);
      expect(result).toMatchObject({
        type: AccountType.EVM,
      });
    });

    it("should call addHDKeyring", async () => {
      const Vault = (await import("./Vault")).default;

      const saveKeyring = vi.fn();
      Vault.getInstance = vi.fn().mockImplementation(() => ({
        keyrings: {
          EVM: undefined,
          WASM: undefined,
          IMPORTED_EVM: undefined,
          IMPORTED_WASM: undefined,
        },
        getKeyring: () => null,
        saveKeyring: () => saveKeyring(),
      }));

      const keyring = await Vault.getKeyring(AccountType.EVM, "mnemonictest");
      expect(keyring).toMatchObject({
        name: "EVM-keyring",
      });
    });
    it("should throw error", async () => {
      const Vault = (await import("./Vault")).default;

      Vault.getInstance = vi.fn().mockImplementation(() => ({
        keyrings: {
          EVM: undefined,
          WASM: undefined,
          IMPORTED_EVM: undefined,
          IMPORTED_WASM: undefined,
        },
        getKeyring: () => null,
      }));

      try {
        await Vault.getKeyring(AccountType.EVM);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toBe("Error: keyring_not_found");
      }
    });
  });

  describe("addHDKeyring", () => {
    it("should add WASM hd keyring", async () => {
      const Vault = (await import("./Vault")).default;
      const saveKeyring = vi.fn();
      Vault.saveKeyring = saveKeyring;

      await Vault["addHDKeyring"](AccountType.WASM, "mnemonic");
      expect(saveKeyring).toHaveBeenCalled();
    });

    it("should add EVM hd keyring", async () => {
      const Vault = (await import("./Vault")).default;
      const saveKeyring = vi.fn();
      Vault.saveKeyring = saveKeyring;

      await Vault["addHDKeyring"](AccountType.EVM, "mnemonic");
      expect(saveKeyring).toHaveBeenCalled();
    });
  });

  it("is invalid", async () => {
    const Vault = (await import("./Vault")).default;
    Vault.getInstance = vi.fn().mockImplementation(() => ({
      keyrings: {
        EVM: undefined,
        WASM: undefined,
        IMPORTED_EVM: undefined,
        IMPORTED_WASM: undefined,
      },
    }));

    const result = Vault.isInvalid({} as Vault);
    expect(result).toBe(true);
  });
});
