import { AccountType } from "../../../accounts/types";
import Extension from "./Extension";
import { selectedEVMChainMock } from "../../../tests/mocks/chain-mocks";
import { expect } from "vitest";
import {
  selectedEVMAccountMock,
  accountsMocks,
} from "../../../tests/mocks/account-mocks";
import { SettingType } from "../../../storage/entities/settings/types";
import { SettingKey } from "../../../storage/entities/settings/types";
import Record from "../../../storage/entities/activity/Record";
import { RecordStatus } from "../../../storage/entities/activity/types";
import { selectedWASMChainMock } from "../../../tests/mocks/chain-mocks";
import { SUBTRATE_CHAINS } from "@src/constants/chainsData";

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

describe("Extension", () => {
  beforeAll(() => {
    vi.mock("@src/storage/Auth", () => ({
      default: {
        getInstance: vi.fn().mockReturnValue({
          signUp: vi.fn(),
        }),
        signOut: vi.fn(),
        isAuthorized: vi.fn().mockReturnValue(true),
        signIn: vi.fn(),
        isSessionActive: vi.fn().mockReturnValue(true),
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
      },
    }));
    vi.mock("@src/storage/entities/SelectedAccount", () => {
      class _SelectedAccount {
        static get() {
          return selectedEVMAccountMock;
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
      class BaseEntityMock {}

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
  });

  describe("validatePasswordFormat", () => {
    it("should be valid", () => {
      const extension = new Extension();
      const result = extension["validatePasswordFormat"]("Test.123");
      expect(result).toBe(undefined);
    });

    it("should return password_required error", () => {
      try {
        const extension = new Extension();
        extension["validatePasswordFormat"]("");
      } catch (error) {
        expect(String(error)).toEqual("Error: password_required");
      }
    });

    it("should return password_invalid error", () => {
      try {
        const extension = new Extension();
        extension["validatePasswordFormat"]("123456");
      } catch (error) {
        expect(String(error)).toEqual("Error: password_invalid");
      }
    });
  });

  describe("validatePrivateKeyOrSeedFormat", () => {
    it("should be valid", () => {
      const SEED =
        "alarm skin dust shock fiber cruel virus brick slim culture hen leisure";
      const extension = new Extension();

      const result = extension["validatePrivateKeyOrSeedFormat"](SEED);
      expect(result).toBe(undefined);
    });

    it("should return private_key_or_seed_required error", () => {
      const SEED = "";
      try {
        const extension = new Extension();
        extension["validatePrivateKeyOrSeedFormat"](SEED);
      } catch (error) {
        expect(String(error)).toEqual("Error: private_key_or_seed_required");
      }
    });

    it("should return private_key_or_seed_invalid error", () => {
      const SEED = "123";
      try {
        const extension = new Extension();
        extension["validatePrivateKeyOrSeedFormat"](SEED);
      } catch (error) {
        expect(String(error)).toEqual("Error: private_key_or_seed_invalid");
      }
    });
  });

  describe("signUp", () => {
    it("should signUp", async () => {
      const PASSWORD = "Test.123";
      const SEED =
        "alarm skin dust shock fiber cruel virus brick slim culture hen leisure";
      const extension = new Extension();

      const result = await extension["signUp"]({
        password: PASSWORD,
        privateKeyOrSeed: SEED,
      });
      expect(result).toBe(undefined);
    });

    it("should throw error", async () => {
      const PASSWORD = "Test.123";
      const SEED = "";

      try {
        const extension = new Extension();
        await extension["signUp"]({
          password: PASSWORD,
          privateKeyOrSeed: SEED,
        });
      } catch (error) {
        expect(String(error)).toEqual("Error: private_key_or_seed_required");
      }
    });
  });

  it("should be authorized", async () => {
    const extension = new Extension();
    const result = extension["isAuthorized"]();
    expect(result).toBe(true);
  });

  describe("createAccounts", () => {
    it("should create accounts", async () => {
      const SEED =
        "alarm skin dust shock fiber cruel virus brick slim culture hen leisure";
      const NAME = "created";
      const PASSWORD = "Test.123";
      const IS_SIGNUP = true;

      const extension = new Extension();
      const result = await extension["createAccounts"]({
        seed: SEED,
        name: NAME,
        password: PASSWORD,
        isSignUp: IS_SIGNUP,
      });
      expect(result).toBe(true);
    });

    it("should create accounts with isSignUp in false", async () => {
      const SEED =
        "alarm skin dust shock fiber cruel virus brick slim culture hen leisure";
      const NAME = "created";
      const PASSWORD = "Test.123";
      const IS_SIGNUP = false;

      const extension = new Extension();
      const result = await extension["createAccounts"]({
        seed: SEED,
        name: NAME,
        password: PASSWORD,
        isSignUp: IS_SIGNUP,
      });
      expect(result).toBe(true);
    });
  });

  describe("importAccount", () => {
    it("should import account", async () => {
      const SEED =
        "alarm skin dust shock fiber cruel virus brick slim culture hen leisure";
      const NAME = "created";
      const PASSWORD = "Test.123";
      const type = AccountType.IMPORTED_WASM;
      const IS_SIGNUP = true;
      const extension = new Extension();

      const result = await extension["importAccount"]({
        privateKeyOrSeed: SEED,
        name: NAME,
        password: PASSWORD,
        type,
        isSignUp: IS_SIGNUP,
      });
      expect(result).toBe(undefined);
    });
    it("should import account with isSignUp in false", async () => {
      const SEED =
        "alarm skin dust shock fiber cruel virus brick slim culture hen leisure";
      const NAME = "created";
      const PASSWORD = "Test.123";
      const type = AccountType.IMPORTED_WASM;
      const IS_SIGNUP = false;
      const extension = new Extension();

      const result = await extension["importAccount"]({
        privateKeyOrSeed: SEED,
        name: NAME,
        password: PASSWORD,
        type,
        isSignUp: IS_SIGNUP,
      });
      expect(result).toBe(undefined);
    });
  });

  it("should change password", async () => {
    const SelectedAccount = (
      await import("../../../storage/entities/SelectedAccount")
    ).default;
    SelectedAccount.get = vi.fn().mockReturnValue({
      value: {
        type: AccountType.EVM,
        address: "EVM-1234",
        keyring: "EVM",
      },
      key: "EVM-1234",
    });

    const Vault = (await import("../../../storage/entities/Vault")).default;
    Vault.getKeyring = vi.fn().mockReturnValue({
      getKey: () => {
        return "1234";
      },
    });

    const PASSWORD = "Test.123";
    const extension = new Extension();

    const result = await extension["changePassword"]({
      currentPassword: PASSWORD,
      newPassword: PASSWORD,
    });
    expect(result).toBe(undefined);
  });

  it("should remove key", async () => {
    const extension = new Extension();

    const result = await extension["removeAccount"]({
      key: "EVM-1234",
    });
    expect(result).toBe(undefined);
  });

  it("should change name", async () => {
    const extension = new Extension();

    const result = await extension["changeAccountName"]({
      key: "EVM-1234",
      newName: "test",
    });
    expect(result).toBe(undefined);
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
    const extension = new Extension();
    const result = await extension["signIn"]({
      password: "Test.123",
    });
    expect(result).toBe(undefined);
  });

  it("should be signed up", async () => {
    const extension = new Extension();
    const result = await extension["alreadySignedUp"]();
    expect(result).toBe(true);
  });

  describe("areAccountsInitialized", () => {
    it("should true", async () => {
      const Accounts = await import("../../../storage/entities/Accounts");
      Accounts.default.get = vi.fn().mockReturnValue({
        data: {
          "EVM-1234": {
            type: AccountType.EVM,
          },
        },
      });

      const extension = new Extension();
      const result = await extension["areAccountsInitialized"]();
      expect(result).toBe(true);
    });

    it("should return false", async () => {
      const Accounts = await import("../../../storage/entities/Accounts");
      Accounts.default.get = vi.fn().mockReturnValue(undefined);

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

  describe("showKey", () => {
    it("should return key", async () => {
      const SelectedAccount = (
        await import("../../../storage/entities/SelectedAccount")
      ).default;
      SelectedAccount.get = vi.fn().mockReturnValue({
        value: {
          type: AccountType.EVM,
          address: "EVM-1234",
          keyring: "EVM",
        },
        key: "EVM-1234",
      });

      const Vault = (await import("../../../storage/entities/Vault")).default;
      Vault.getKeyring = vi.fn().mockReturnValue({
        getKey: () => {
          return "1234";
        },
      });

      const extension = new Extension();
      const result = await extension["showKey"]();
      expect(result).toBe("1234");
    });

    it("should return undefined", async () => {
      const SelectedAccount = (
        await import("../../../storage/entities/SelectedAccount")
      ).default;
      SelectedAccount.get = vi.fn().mockReturnValue(undefined);

      const extension = new Extension();
      const result = await extension["showKey"]();
      expect(result).toBe(undefined);
    });
  });

  it("get account", async () => {
    const extension = new Extension();
    const result = await extension["getAccount"]({
      key: "EVM-1234",
    });
    expect(result).toBe(undefined);
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
    const extension = new Extension();
    const result = await extension["deriveAccount"]({
      name: "derived-evm",
      type: AccountType.EVM,
    });
    expect(result).toMatchObject({
      key: "WASM-123",
      value: "0x123",
      type: AccountType.WASM,
    });
  });

  it("should set network", async () => {
    const extension = new Extension();
    const result = await extension["setNetwork"]({
      chain: selectedWASMChainMock,
    });
    expect(result).toBe(true);
  });

  it("should return selected account", async () => {
    const _SelectedAccountMock = await import(
      "../../../storage/entities/SelectedAccount"
    );
    _SelectedAccountMock.default.get = vi
      .fn()
      .mockReturnValue(selectedEVMAccountMock);

    const extension = new Extension();
    const result = await extension["getSelectedAccount"]();
    expect(result).toMatchObject(selectedEVMAccountMock);
  });

  it("should return selected network", async () => {
    const Storage = await import("../../../storage/Storage");
    Storage.default.getInstance = vi.fn().mockReturnValue({
      storage: {
        get: vi.fn(() => null),
        set: vi.fn(),
        remove: vi.fn(),
      },
    });

    const _NetowrkMock = await import("../../../storage/entities/Network");
    _NetowrkMock.default.get = vi.fn().mockReturnValue(selectedEVMChainMock);

    const extension = new Extension();
    const result = await extension["getNetwork"]();
    expect(result).toMatchObject(selectedEVMChainMock);
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
        await import("../../../storage/entities/registry/Registry")
      ).default;
      const get = vi.fn().mockReturnValue({
        getAllContacts: () => contactsMock,
        getRecentAddresses: () => [],
      });
      _Registry.get = get;

      const _Network = (await import("../../../storage/entities/Network"))
        .default;
      const getNetwork = vi.fn().mockReturnValue({
        chain: {
          supportedAccounts: [],
        },
      });
      _Network.get = getNetwork;

      const _AccountManage = (await import("../../../accounts/AccountManager"))
        .default;
      const getAll = vi.fn().mockReturnValue({
        getAll: () => {
          return [];
        },
      });

      _AccountManage.getAll = getAll;
      const extension = new Extension();
      const result = await extension["getRegistryAddresses"]();
      expect(result.contacts).toMatchObject(contactsMock);
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

      const _Network = (await import("../../../storage/entities/Network"))
        .default;
      const getNetwork = vi.fn().mockReturnValue({ chain: undefined });
      _Network.get = getNetwork;

      try {
        const extension = new Extension();
        await extension["getRegistryAddresses"]();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_network");
      }
    });

    it("should return network error", async () => {
      const _Registry = (
        await import("../../../storage/entities/registry/Registry")
      ).default;
      const get = vi.fn().mockReturnValue({});
      _Registry.get = get;

      const _Network = (await import("../../../storage/entities/Network"))
        .default;
      const getNetwork = vi.fn().mockReturnValue({
        chain: {
          supportedAccounts: [],
        },
      });
      _Network.get = getNetwork;

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

  describe("save contact", () => {
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
  });

  it("removeContact", async () => {
    const _Registry = (
      await import("../../../storage/entities/registry/Registry")
    ).default;
    const removeContact = vi.fn();
    _Registry.removeContact = removeContact;

    const extension = new Extension();
    await extension["removeContact"]({ address: "0x12345" });
    expect(removeContact).toHaveBeenCalled();
  });

  it("getActivity", async () => {
    const _Activity = (
      await import("../../../storage/entities/activity/Activity")
    ).default;
    const getRecords = vi.fn();

    _Activity.getRecords = getRecords;

    const extension = new Extension();
    await extension["getActivity"]();
    expect(getRecords).toHaveBeenCalled();
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

    const extension = new Extension();
    await extension["addActivity"]({ txHash: "0x1234", record: {} as Record });
    expect(addRecent).toHaveBeenCalled();
  });

  it("updateActivity", async () => {
    const _Activity = (
      await import("../../../storage/entities/activity/Activity")
    ).default;
    const updateRecordStatus = vi.fn();
    _Activity.updateRecordStatus = updateRecordStatus;

    const extension = new Extension();
    await extension["updateActivity"]({
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
