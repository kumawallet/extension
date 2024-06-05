import { AccountType } from "../../../accounts/types";
import Extension from "./Extension";
import { expect } from "vitest";
import {
  selectedEVMAccountMock,
  accountsMocks,
} from "../../../tests/mocks/account-mocks";
import { SettingType } from "../../../storage/entities/settings/types";
import { SettingKey } from "../../../storage/entities/settings/types";
import Record from "../../../storage/entities/activity/Record";
import { RecordStatus } from "../../../storage/entities/activity/types";
import { SUBTRATE_CHAINS } from "@src/constants/chainsData";
import { ChainType } from "@src/types";
import { BehaviorSubject } from "rxjs";

const accountManageMock = {
  saveBackup: vi.fn(),
};

const getSettingsMock = {
  get: vi.fn().mockReturnValue({
    general: {
      languages: {
        value: [
          {
            lang: "English",
            code: "en",
          },
        ],
      },
    },
  }),
  getAll: vi.fn().mockReturnValue({
    general: {
      languages: {
        value: [
          {
            lang: "English",
            code: "en",
          },
        ],
      },
    },
  }),
};

const contactsMock = [
  {
    name: "test",
    address: "0x123",
  },
];

const dataMock = {
  PASSWORD: "Test.123",
  NEW_PASSWORD: "Test.123",
  SEED: "alarm skin dust shock fiber cruel virus brick slim culture hen leisure",
};

describe("Extension", () => {
  beforeAll(() => {
    vi.mock("@src/storage/entities/Provider", () => ({
      Provider: class {
        statusNetwork = new BehaviorSubject({});

        setProvider() {
          return Promise.resolve();
        }

        getProviders() {
          return Promise.resolve();
        }

        reset() {
          return Promise.resolve();
        }

        disconnectChain() {
          return Promise.resolve();
        }
      },
    }));

    vi.mock("@src/storage/entities/TransactionHistory", () => ({
      default: class {
        setAccount() {
          return Promise.resolve();
        }

        addChain() {
          return Promise.resolve();
        }

        removeChains() {
          return Promise.resolve();
        }
      },
    }));

    vi.mock("@src/storage/Auth", () => ({
      default: {
        getInstance: vi.fn().mockReturnValue({
          signUp: vi.fn(),
        }),
        signOut: vi.fn(),
        isAuthorized: vi.fn().mockReturnValue(true),
        signIn: vi.fn(),
        isSessionActive: vi.fn().mockReturnValue(true),
        setAutoLock: vi.fn(),
        unlock: vi.fn(),
        getLock: vi.fn().mockReturnValue(5),
      },
    }));
    vi.mock("@src/storage/entities/Account", () => ({
      default: {},
    }));
    vi.mock("@src/storage/entities/Network", () => ({
      default: {
        getInstance: vi.fn().mockReturnValue({
          set: vi.fn(),
        }),
        set: vi.fn(),
        get: () => {
          return Promise.resolve({
            selectedChain: {},
            chain: null,
          });
        },
      },
    }));

    vi.mock("@src/storage/entities/SelectedAccount", () => {
      class _SelectedAccount {
        static get() {
          return Promise.resolve(selectedEVMAccountMock);
        }
        static set() {
          vi.fn();
        }
        static fromAccount() {
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
    vi.mock("@src/storage/entities/Vault", () => ({
      default: {
        alreadySignedUp: vi.fn().mockReturnValue(true),
      },
    }));
    vi.mock("./storage/entities/BackUp.ts", () => ({
      default: {},
    }));
    vi.mock("./storage/entities/settings/Settings", () => ({
      default: {},
    }));
    vi.mock("@src/storage/entities/registry/Registry", () => ({
      default: {},
    }));
    vi.mock("@src/storage/entities/activity/Activity", () => ({
      default: {},
    }));
    vi.mock("@src/storage/entities/Chains", () => ({
      default: {},
    }));
    vi.mock("./storage/entities/BaseEntity", () => {
      class BaseEntityMock {
        get() {}
      }

      return {
        default: BaseEntityMock,
      };
    });
    vi.mock("@src/storage/Storage", () => ({
      default: {
        getInstance: vi.fn().mockReturnValue({
          init: vi.fn(),
          resetWallet: vi.fn(),
        }),
        init: vi.fn(),
      },
    }));
    vi.mock("@src/accounts/AccountManager", () => ({
      default: {
        saveBackup: () => accountManageMock.saveBackup(),
        addAccount: vi.fn().mockReturnValue({
          key: "WASM-123",
          value: "0x123",
          type: AccountType.WASM,
        }),
        getAccount: vi.fn(),
        importAccount: vi.fn().mockReturnValue({
          key: "WASM-123",
          value: "0x123",
          type: AccountType.WASM,
        }),
        derive: vi.fn().mockReturnValue({
          key: "WASM-123",
          value: "0x123",
          type: AccountType.WASM,
        }),
        changePassword: vi.fn(),
        remove: vi.fn(),
        changeName: vi.fn(),
        areAccountsInitialized: vi.fn().mockReturnValue(true),
      },
    }));
    vi.mock("@src/storage/entities/Accounts", () => ({
      default: {
        get: vi.fn().mockResolvedValue({
          data: {
            "EVM-1234": {
              type: AccountType.EVM,
            },
          },
        }),
      },
    }));
  });

  it("should instance", () => {
    const extension = new Extension();
    expect(extension).toBeDefined();
  });

  it("should be authorized", async () => {
    const Vault = (await import("@src/storage/entities/Vault")).default;
    Vault.getInstance = vi.fn().mockReturnValue({
      keyrings: {
        WASM: {},
      },
    });

    const Auth = (await import("@src/storage/Auth")).default;
    Auth.isAuthorized = vi.fn().mockReturnValue(true);

    const extension = new Extension();
    const result = await extension["isAuthorized"]();
    expect(result).toBe(true);
  });

  it("should change password", async () => {
    const AccountManager = (await import("@src/accounts/AccountManager"))
      .default;

    const extension = new Extension();
    await extension["changePassword"]({
      currentPassword: dataMock.PASSWORD,
      newPassword: dataMock.NEW_PASSWORD,
    });

    expect(AccountManager.changePassword).toHaveBeenCalled();
  });

  describe("signUp", () => {
    it("should signUp", async () => {
      const Storage = (await import("@src/storage/Storage")).default;

      const extension = new Extension();
      await extension["signUp"]({
        password: dataMock.PASSWORD,
        privateKeyOrSeed: dataMock.SEED,
      });

      expect(Storage.init).toHaveBeenCalled();
    });

    it("should throw error", async () => {
      try {
        const extension = new Extension();
        await extension["signUp"]({
          password: dataMock.PASSWORD,
          privateKeyOrSeed: "",
        });
      } catch (error) {
        expect(String(error)).toEqual("Error: private_key_or_seed_required");
      }
    });
  });

  describe("createAccounts", () => {
    it("should create accounts", async () => {
      const extension = new Extension();
      const result = await extension["createAccounts"]({
        seed: dataMock.SEED,
        name: "",
        password: dataMock.PASSWORD,
        isSignUp: true,
      });
      expect(result).toBe(true);
    });

    it("should create accounts with isSignUp in false", async () => {
      const extension = new Extension();

      // @ts-expect-error --- private method
      const signUp = vi.spyOn(extension, "signUp");

      const result = await extension["createAccounts"]({
        seed: dataMock.SEED,
        name: "",
        password: dataMock.PASSWORD,
        isSignUp: false,
      });

      expect(result).toBe(true);
      expect(signUp).not.toHaveBeenCalled();
    });
  });

  describe("importAccount", () => {
    it("should import account", async () => {
      const extension = new Extension();

      const result = await extension["importAccount"]({
        privateKeyOrSeed: dataMock.SEED,
        name: "",
        password: dataMock.PASSWORD,
        accountTypesToImport: [AccountType.WASM],
        isSignUp: true,
      });
      expect(result).toBe(undefined);
    });

    it("should import account with isSignUp in false", async () => {
      const extension = new Extension();

      // @ts-expect-error --- private method
      const signUp = vi.spyOn(extension, "signUp");

      const result = await extension["importAccount"]({
        privateKeyOrSeed: dataMock.SEED,
        name: "",
        password: dataMock.PASSWORD,
        accountTypesToImport: [AccountType.WASM],
        isSignUp: false,
      });

      expect(result).toBe(undefined);
      expect(signUp).not.toHaveBeenCalled();
    });
  });

  it("should remove account", async () => {
    const AccountManager = (await import("@src/accounts/AccountManager"))
      .default;

    const extension = new Extension();

    await extension["removeAccount"]({
      key: "EVM-1234",
    });
    expect(AccountManager.remove).toHaveBeenCalled();
  });

  it("should change name", async () => {
    const AccountManager = (await import("@src/accounts/AccountManager"))
      .default;

    const extension = new Extension();

    await extension["changeAccountName"]({
      key: "EVM-1234",
      newName: "test",
    });
    expect(AccountManager.changeName).toHaveBeenCalled();
  });

  describe("resetWallet", () => {
    it("should reset wallet", async () => {
      const Auth = (await import("../../../storage/Auth")).default;
      Auth.isAuthorized = vi.fn().mockReturnValue(true);

      const extension = new Extension();

      const result = await extension["resetWallet"]();
      expect(result).toBe(undefined);
    });

    it("should throw error", async () => {
      const Auth = (await import("../../../storage/Auth")).default;
      Auth.isAuthorized = vi.fn().mockReturnValue(false);

      try {
        const extension = new Extension();

        await extension["resetWallet"]();
      } catch (error) {
        expect(String(error)).toEqual("Error: not_authorized");
      }
    });
  });

  it("signIn", async () => {
    const Vault = await import("../../../storage/entities/Vault");
    Vault.default.getInstance = vi.fn().mockResolvedValue({
      keyrings: {},
    });

    const extension = new Extension();
    const result = await extension["signIn"]({
      password: "Test.123",
    });
    expect(result).toBe(undefined);
  });

  it("should set auto lock", async () => {
    const Auth = (await import("../../../storage/Auth")).default;

    const extension = new Extension();
    extension["setAutoLock"]({ time: 10 });

    expect(Auth.setAutoLock).toHaveBeenCalled();
  });

  it("should unlock", async () => {
    const Auth = (await import("../../../storage/Auth")).default;

    const extension = new Extension();
    extension["unlock"]();

    expect(Auth.unlock).toHaveBeenCalled();
  });

  it("should get lock", async () => {
    const extension = new Extension();
    const result = await extension["getLock"]();

    expect(result).toBe(5);
  });

  describe.skip("validatePassword", () => {
    // it("should ")
  });

  it("should be signed up", async () => {
    const extension = new Extension();
    const result = await extension["alreadySignedUp"]();
    expect(result).toBe(true);
  });

  describe("areAccountsInitialized", () => {
    it("should true", async () => {
      const extension = new Extension();
      const result = await extension["areAccountsInitialized"]();
      expect(result).toBe(true);
    });

    it("should return false", async () => {
      const Accounts = await import("../../../storage/entities/Accounts");
      Accounts.default.get = vi.fn().mockResolvedValue(undefined);

      const extension = new Extension();
      const result = await extension["areAccountsInitialized"]();
      expect(result).toBe(false);
    });

    it("should return with catch error false", async () => {
      const Accounts = await import("../../../storage/entities/Accounts");
      Accounts.default.get = vi.fn().mockRejectedValue(undefined);

      try {
        const extension = new Extension();
        await extension["areAccountsInitialized"]();
      } catch (error) {
        expect(error).toBe(false);
      }
    });
  });

  it("should sign out", async () => {
    const extension = new Extension();
    const result = await extension["signOut"]();
    expect(result).toBe(undefined);
  });

  it("should session be active", async () => {
    const Storage = await import("../../../storage/Storage");
    Storage.default.getInstance = vi.fn().mockReturnValue({
      storage: {
        get: vi.fn(() => null),
        set: vi.fn(),
        remove: vi.fn(),
      },
    });

    const extension = new Extension();
    const result = await extension["isSessionActive"]();
    expect(result).toBe(true);
  });

  // describe("showKey", () => {
  //   it("should return key", async () => {
  //     const SelectedAccount = (
  //       await import("../../../storage/entities/SelectedAccount")
  //     ).default;
  //     SelectedAccount.get = vi.fn().mockReturnValue({
  //       value: {
  //         type: AccountType.EVM,
  //         address: "EVM-1234",
  //         keyring: "EVM",
  //       },
  //       key: "EVM-1234",
  //     });

  //     const Vault = (await import("../../../storage/entities/Vault")).default;
  //     Vault.getKeyring = vi.fn().mockReturnValue({
  //       getKey: () => {
  //         return "1234";
  //       },
  //     });

  //     const extension = new Extension();
  //     const result = await extension["showKey"]({
  //       address: "0x1234",
  //     });
  //     expect(result).toBe("1234");
  //   });

  //   it("should return undefined", async () => {
  //     const SelectedAccount = (
  //       await import("../../../storage/entities/SelectedAccount")
  //     ).default;
  //     SelectedAccount.get = vi.fn().mockReturnValue(undefined);

  //     const extension = new Extension();
  //     const result = await extension["showKey"]({
  //       address: "0x1234",
  //     });
  //     expect(result).toBe(undefined);
  //   });
  // });

  it("get account", async () => {
    const extension = new Extension();
    const result = await extension["getAccount"]({
      key: "EVM-1234",
    });
    expect(result).toBe(undefined);
  });

  describe("getAccountsToDerive", () => {
    it("should returns accounts to derive", async () => {
      const AccountManager = (await import("../../../accounts/AccountManager"))
        .default;

      AccountManager.getAll = vi.fn().mockReturnValue({
        getAll: vi.fn().mockReturnValue(accountsMocks),
      });

      const extension = new Extension();
      const result = await extension["getAccountsToDerive"]();
      expect(result).toEqual(accountsMocks);
    });

    it("should returns empty array", async () => {
      const AccountManager = (await import("../../../accounts/AccountManager"))
        .default;

      AccountManager.getAll = vi.fn().mockReturnValue(null);

      const extension = new Extension();
      const result = await extension["getAccountsToDerive"]();
      expect(result).toEqual([]);
    });
  });

  describe("getAllAccounts", () => {
    it("should return all accounts", async () => {
      const _AccountManager = await import("../../../accounts/AccountManager");
      _AccountManager.default.getAll = vi.fn().mockReturnValue({
        getAll: vi.fn().mockReturnValue(accountsMocks),
      });

      const extension = new Extension();
      const result = await extension["getAllAccounts"]({
        type: null,
      });
      expect(result).toEqual(accountsMocks);
    });

    it("should return empty array", async () => {
      const _AccountManager = await import("../../../accounts/AccountManager");
      _AccountManager.default.getAll = vi.fn().mockReturnValue(undefined);

      const extension = new Extension();
      const result = await extension["getAllAccounts"]({
        type: null,
      });
      expect(result).toEqual([]);
    });
  });

  it("should derive account", async () => {
    const AccountManager = (await import("../../../accounts/AccountManager"))
      .default;

    AccountManager.derive = vi.fn();

    const extension = new Extension();

    // @ts-expect-error --- private method
    vi.spyOn(extension, "setSelectedAccount").mockReturnValue(null);

    await extension["deriveAccount"]({
      name: "derived-evm",
      type: AccountType.EVM,
      address: "0x123",
    });

    expect(AccountManager.derive).toHaveBeenCalled();
  });

  it("should set network", async () => {
    const extension = new Extension();
    const result = await extension["setNetwork"]({
      id: "polygon",
      type: ChainType.EVM,
      isTestnet: false,
    });
    expect(result).toEqual({
      polygon: {
        isTestnet: false,
        type: "evm",
      },
      polkadot: {
        isTestnet: false,
        type: "wasm",
      },
    });
  });

  it("deleteSelectNetwork", async () => {
    const extension = new Extension();

    extension["chains"].next({
      ethereum: {
        isTestnet: false,
        type: ChainType.EVM,
      },
    });

    const result = await extension["deleteSelectNetwork"]({
      id: "ethereum",
    });
    expect(result).not.toBe({
      ethereum: {
        isTestnet: false,
        type: ChainType.EVM,
      },
    });
  });

  it("should return selected account", async () => {
    const _SelectedAccountMock = await import(
      "../../../storage/entities/SelectedAccount"
    );
    _SelectedAccountMock.default.get = vi
      .fn()
      .mockResolvedValue(selectedEVMAccountMock);

    const extension = new Extension();
    const result = await extension["getSelectedAccount"]();
    expect(result).toMatchObject(selectedEVMAccountMock);
  });

  describe("getGeneralSettings", () => {
    it("should return general settings", async () => {
      const _Settings = (
        await import("../../../storage/entities/settings/Settings")
      ).default;
      const get = vi.fn().mockReturnValue(getSettingsMock);
      _Settings.get = get;

      const extension = new Extension();
      const result = await extension["getGeneralSettings"]();
      expect(result).toMatchObject(getSettingsMock.getAll());
    });

    it("should return error", async () => {
      const _Settings = (
        await import("../../../storage/entities/settings/Settings")
      ).default;
      const get = vi.fn().mockReturnValue(undefined);
      _Settings.get = get;

      try {
        const extension = new Extension();
        await extension["getGeneralSettings"]();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_settings");
      }
    });
  });

  describe("getAdvancedSettings", () => {
    it("should return general settings", async () => {
      const _Settings = (
        await import("../../../storage/entities/settings/Settings")
      ).default;
      const get = vi.fn().mockReturnValue(getSettingsMock);
      _Settings.get = get;

      const extension = new Extension();
      const result = await extension["getAdvancedSettings"]();
      expect(result).toMatchObject(getSettingsMock.getAll());
    });

    it("should return error", async () => {
      const _Settings = (
        await import("../../../storage/entities/settings/Settings")
      ).default;
      const get = vi.fn().mockReturnValue(undefined);
      _Settings.get = get;

      try {
        const extension = new Extension();
        await extension["getAdvancedSettings"]();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_settings");
      }
    });
  });

  describe("getSetting", () => {
    it("should return general settings", async () => {
      const _Settings = (
        await import("../../../storage/entities/settings/Settings")
      ).default;
      const get = vi.fn().mockReturnValue(getSettingsMock);
      _Settings.get = get;

      const extension = new Extension();
      const result = await extension["getSetting"]({
        type: SettingType.GENERAL,
        key: SettingKey["LANGUAGES"],
      });
      expect(result).toMatchObject(getSettingsMock.get());
    });

    it("should return error", async () => {
      const _Settings = (
        await import("../../../storage/entities/settings/Settings")
      ).default;
      const get = vi.fn().mockReturnValue(undefined);
      _Settings.get = get;

      try {
        const extension = new Extension();
        await extension["getSetting"]({
          type: SettingType.GENERAL,
          key: SettingKey["LANGUAGES"],
        });
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_settings");
      }
    });
  });

  describe("updateSetting", () => {
    it("should return settings", async () => {
      const _Settings = (
        await import("../../../storage/entities/settings/Settings")
      ).default;

      const set = vi.fn();
      const update = vi.fn();
      const get = vi.fn().mockReturnValue({
        update,
        set,
      });
      _Settings.get = get;
      _Settings.set = set;

      const extension = new Extension();
      await extension["updateSetting"]({
        type: SettingType.GENERAL,
        key: SettingKey["LANGUAGES"],
        value: "en",
      });
      expect(set).toHaveBeenCalled();
    });

    it("should return error", async () => {
      const _Settings = (
        await import("../../../storage/entities/settings/Settings")
      ).default;

      const get = vi.fn().mockReturnValue(undefined);
      _Settings.get = get;

      try {
        const extension = new Extension();
        await extension["updateSetting"]({
          type: SettingType.GENERAL,
          key: SettingKey["LANGUAGES"],
          value: "en",
        });
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_settings");
      }
    });
  });

  describe("getContacts", () => {
    it("should return contacts", async () => {
      const _Registry = (
        await import("../../../storage/entities/registry/Registry")
      ).default;

      const get = vi.fn().mockReturnValue({
        getAllContacts: vi.fn().mockReturnValue(contactsMock),
      });
      _Registry.get = get;

      const extension = new Extension();
      const result = await extension["getContacts"]();
      expect(result).toMatchObject(contactsMock);
    });

    it("should return error", async () => {
      const _Registry = (
        await import("../../../storage/entities/registry/Registry")
      ).default;

      const get = vi.fn().mockReturnValue(undefined);
      _Registry.get = get;

      try {
        const extension = new Extension();
        await extension["getContacts"]();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_registry");
      }
    });
  });

  describe("getRegistryAddresses", () => {
    it("should return registry addresses", async () => {
      const contactsMock = [
        {
          value: {
            name: "account1",
            address: "0x12345",
          },
        },
      ];

      const _Registry = (
        await import("@src/storage/entities/registry/Registry")
      ).default;
      const get = vi.fn().mockReturnValue({
        getAllContacts: () => contactsMock,
        getRecentAddresses: () => [],
      });
      _Registry.get = get;

      const _AccountManage = (await import("@src/accounts/AccountManager"))
        .default;
      const getAll = vi.fn().mockResolvedValue({
        getAll: () => {
          return [];
        },
      });

      _AccountManage.getAll = getAll;
      const extension = new Extension();
      const result = await extension["getRegistryAddresses"]();
      expect(result.accounts).toMatchObject(contactsMock);
    });

    it("should return registry error", async () => {
      const _Registry = (
        await import("../../../storage/entities/registry/Registry")
      ).default;

      const get = vi.fn().mockReturnValue(undefined);
      _Registry.get = get;

      try {
        const extension = new Extension();
        await extension["getRegistryAddresses"]();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_registry");
      }
    });

    it("should return network error", async () => {
      const _Registry = (
        await import("../../../storage/entities/registry/Registry")
      ).default;
      const get = vi.fn().mockReturnValue({});
      _Registry.get = get;

      const _AccountManage = (await import("../../../accounts/AccountManager"))
        .default;
      const getAll = vi.fn().mockReturnValue(undefined);

      _AccountManage.getAll = getAll;

      try {
        const extension = new Extension();
        await extension["getRegistryAddresses"]();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_accounts");
      }
    });
  });

  describe("contact", () => {
    it("should save contact", async () => {
      const _Registry = (
        await import("../../../storage/entities/registry/Registry")
      ).default;
      const addContact = vi.fn();

      _Registry.addContact = addContact;

      const extension = new Extension();

      await extension["saveContact"]({
        contact: {
          name: "account1",
          address: "0x12345",
        },
      });
      expect(addContact).toHaveBeenCalled();
    });

    it("should update contact", async () => {
      const _Registry = (
        await import("../../../storage/entities/registry/Registry")
      ).default;
      const updateContact = vi.fn();
      _Registry.updateContact = updateContact;

      const extension = new Extension();
      await extension["updateContact"]({
        name: "account1",
        address: "0x12345",
      });
      expect(updateContact).toHaveBeenCalled();
    });

    it("should remove contact", async () => {
      const _Registry = (
        await import("../../../storage/entities/registry/Registry")
      ).default;
      const removeContact = vi.fn();
      _Registry.removeContact = removeContact;

      const extension = new Extension();
      await extension["removeContact"]({ address: "0x12345" });
      expect(removeContact).toHaveBeenCalled();
    });
  });

  it("saveCustomChain", async () => {
    const _Chains = (await import("../../../storage/entities/Chains")).default;

    const saveCustomChain = vi.fn();
    _Chains.saveCustomChain = saveCustomChain;

    const extension = new Extension();
    extension["saveCustomChain"]({ chain: SUBTRATE_CHAINS[0] });
    expect(saveCustomChain).toHaveBeenCalled();
  });

  it("removeCustomChain", async () => {
    const _Chains = (await import("../../../storage/entities/Chains")).default;

    const removeCustomChain = vi.fn();
    _Chains.removeCustomChain = removeCustomChain;

    const extension = new Extension();
    extension["removeCustomChain"]({ chainName: SUBTRATE_CHAINS[0].name });
    expect(removeCustomChain).toHaveBeenCalled();
  });

  it("addActivity", async () => {
    const _Activity = (
      await import("../../../storage/entities/activity/Activity")
    ).default;
    const addRecord = vi.fn();
    _Activity.addRecord = addRecord;

    const _Registry = (
      await import("../../../storage/entities/registry/Registry")
    ).default;
    const addRecent = vi.fn();
    _Registry.addRecentAddress = addRecent;

    const AccountManager = (await import("../../../accounts/AccountManager"))
      .default;
    AccountManager.getAll = vi.fn().mockReturnValue({
      getAll: vi.fn().mockReturnValue(accountsMocks),
    });

    const extension = new Extension();
    await extension["addActivity"]({
      senderAddress: accountsMocks[0].value.address,
      txHash: "0x1234",
      record: {} as Record,
    });
    expect(addRecent).toHaveBeenCalled();
  });

  it("updateActivity", async () => {
    const _Activity = (
      await import("../../../storage/entities/activity/Activity")
    ).default;
    const updateRecordStatus = vi.fn();
    _Activity.updateRecordStatus = updateRecordStatus;

    const AccountManager = (await import("../../../accounts/AccountManager"))
      .default;
    AccountManager.getAll = vi.fn().mockReturnValue({
      getAll: vi.fn().mockReturnValue(accountsMocks),
    });

    const extension = new Extension();
    await extension["updateActivity"]({
      senderAddress: accountsMocks[0].value.address,
      txHash: "0x1234",
      status: RecordStatus.SUCCESS,
    });
    expect(updateRecordStatus).toHaveBeenCalled();
  });

  it("addAsset", async () => {
    const _Assets = (await import("../../../storage/entities/Assets")).default;
    const addAsset = vi.fn();
    _Assets.addAsset = addAsset;

    const extension = new Extension();
    await extension["addAsset"]({
      chain: SUBTRATE_CHAINS[0].name,
      asset: {} as unknown as {
        symbol: string;
        address: string;
        decimals: number;
      },
    });
    expect(addAsset).toHaveBeenCalled();
  });

  it("getAssetsByChain", async () => {
    const _Assets = (await import("../../../storage/entities/Assets")).default;
    const getByChain = vi.fn();
    _Assets.getByChain = getByChain;

    const extension = new Extension();
    await extension["getAssetsByChain"]({ chain: SUBTRATE_CHAINS[0].name });
    expect(getByChain).toHaveBeenCalled();
  });

  it("getTrustedSites", async () => {
    const _TrustedSites = (
      await import("../../../storage/entities/TrustedSites")
    ).default;
    const getAll = vi.fn();
    _TrustedSites.getAll = getAll;

    const extension = new Extension();
    extension["getTrustedSites"]();
    expect(getAll).toHaveBeenCalled();
  });

  it("addTrustedSite", async () => {
    const _TrustedSites = (
      await import("../../../storage/entities/TrustedSites")
    ).default;
    const addSite = vi.fn();
    _TrustedSites.addSite = addSite;

    const extension = new Extension();
    extension["addTrustedSite"]({ site: "https://test.com" });
    expect(addSite).toHaveBeenCalled();
  });

  it("removeTrustedSite", async () => {
    const _TrustedSites = (
      await import("../../../storage/entities/TrustedSites")
    ).default;
    const removeSite = vi.fn();
    _TrustedSites.removeSite = removeSite;

    const extension = new Extension();
    extension["removeTrustedSite"]({ site: "https://test.com" });
    expect(removeSite).toHaveBeenCalled();
  });
});
