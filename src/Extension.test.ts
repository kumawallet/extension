import { AccountType } from "./accounts/types";
import Extension from "./Extension";
import { selectedEVMChainMock } from "./tests/mocks/chain-mocks";
import { expect } from "vitest";
import {
  selectedEVMAccountMock,
  accountsMocks,
} from "./tests/mocks/account-mocks";
import { SettingType } from "./storage/entities/settings/types";
import { SettingKey } from "./storage/entities/settings/types";
import { CHAINS } from "./constants/chains";
import Record from "./storage/entities/activity/Record";
import { RecordStatus } from "./storage/entities/activity/types";
import { selectedWASMChainMock } from "./tests/mocks/chain-mocks";
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
    vi.mock("./storage/Auth.ts", () => ({
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
    vi.mock("./storage/entities/Account", () => ({
      default: {},
    }));
    vi.mock("./storage/entities/Network", () => ({
      default: {
        getInstance: vi.fn().mockReturnValue({
          set: vi.fn(),
        }),
        set: vi.fn(),
      },
    }));
    vi.mock("./storage/entities/SelectedAccount.ts", () => {
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
    vi.mock("./storage/entities/Vault.ts", () => ({
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
    vi.mock("./storage/Storage", () => ({
      default: {
        getInstance: vi.fn().mockReturnValue({
          init: vi.fn(),
          resetWallet: vi.fn(),
        }),
        init: vi.fn(),
      },
    }));
    vi.mock("./accounts/AccountManager.ts", () => ({
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
        restorePassword: vi.fn(),
        remove: vi.fn(),
        changeName: vi.fn(),
        areAccountsInitialized: vi.fn().mockReturnValue(true),
      },
    }));
  });

  describe("validatePasswordFormat", () => {
    it("should be valid", () => {
      const result = Extension["validatePasswordFormat"]("Test.123");
      expect(result).toBe(undefined);
    });

    it("should return password_required error", () => {
      try {
        Extension["validatePasswordFormat"]("");
      } catch (error) {
        expect(String(error)).toEqual("Error: password_required");
      }
    });

    it("should return password_invalid error", () => {
      try {
        Extension["validatePasswordFormat"]("123456");
      } catch (error) {
        expect(String(error)).toEqual("Error: password_invalid");
      }
    });
  });

  describe("validatePrivateKeyOrSeedFormat", () => {
    it("should be valid", () => {
      const SEED =
        "alarm skin dust shock fiber cruel virus brick slim culture hen leisure";

      const result = Extension["validatePrivateKeyOrSeedFormat"](SEED);
      expect(result).toBe(undefined);
    });

    it("should return private_key_or_seed_required error", () => {
      const SEED = "";
      try {
        Extension["validatePrivateKeyOrSeedFormat"](SEED);
      } catch (error) {
        expect(String(error)).toEqual("Error: private_key_or_seed_required");
      }
    });

    it("should return private_key_or_seed_invalid error", () => {
      const SEED = "123";
      try {
        Extension["validatePrivateKeyOrSeedFormat"](SEED);
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

      const result = await Extension["signUp"](PASSWORD, SEED);
      expect(result).toBe(undefined);
    });

    it("should throw error", async () => {
      const PASSWORD = "Test.123";
      const SEED = "";

      try {
        await Extension["signUp"](PASSWORD, SEED);
      } catch (error) {
        expect(String(error)).toEqual("Error: private_key_or_seed_required");
      }
    });
  });

  it("should be authorized", () => {
    const result = Extension.isAuthorized();
    expect(result).toBe(true);
  });

  describe("createAccounts", () => {
    it("should create accounts", async () => {
      const SEED =
        "alarm skin dust shock fiber cruel virus brick slim culture hen leisure";
      const NAME = "created";
      const PASSWORD = "Test.123";
      const IS_SIGNUP = true;

      const result = await Extension.createAccounts(
        SEED,
        NAME,
        PASSWORD,
        IS_SIGNUP
      );
      expect(result).toBe(true);
    });

    it("should create accounts with isSignUp in false", async () => {
      const SEED =
        "alarm skin dust shock fiber cruel virus brick slim culture hen leisure";
      const NAME = "created";
      const PASSWORD = "Test.123";
      const IS_SIGNUP = false;

      const result = await Extension.createAccounts(
        SEED,
        NAME,
        PASSWORD,
        IS_SIGNUP
      );
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

      const result = await Extension.importAccount(
        NAME,
        SEED,
        PASSWORD,
        type,
        IS_SIGNUP
      );
      expect(result).toBe(undefined);
    });
    it("should import account with isSignUp in false", async () => {
      const SEED =
        "alarm skin dust shock fiber cruel virus brick slim culture hen leisure";
      const NAME = "created";
      const PASSWORD = "Test.123";
      const type = AccountType.IMPORTED_WASM;
      const IS_SIGNUP = false;

      const result = await Extension.importAccount(
        NAME,
        SEED,
        PASSWORD,
        type,
        IS_SIGNUP
      );
      expect(result).toBe(undefined);
    });
  });

  it("should restore password", async () => {
    const SEED =
      "alarm skin dust shock fiber cruel virus brick slim culture hen leisure";
    const PASSWORD = "Test.123";

    const result = await Extension.restorePassword(SEED, PASSWORD);
    expect(result).toBe(undefined);
  });

  it("should remove key", async () => {
    const result = await Extension.removeAccount("EVM-1234");
    expect(result).toBe(undefined);
  });

  it("should change name", async () => {
    const result = await Extension.changeAccountName("EVM-1234", "test");
    expect(result).toBe(undefined);
  });

  describe("resetWallet", () => {
    it("should reset wallet", async () => {
      const Auth = (await import("./storage/Auth")).default;
      Auth.isAuthorized = vi.fn().mockReturnValue(true);

      const result = await Extension.resetWallet();
      expect(result).toBe(undefined);
    });

    it("should throw error", async () => {
      const Auth = (await import("./storage/Auth")).default;
      Auth.isAuthorized = vi.fn().mockReturnValue(false);

      try {
        await Extension.resetWallet();
      } catch (error) {
        expect(String(error)).toEqual("Error: not_authorized");
      }
    });
  });

  it("signIn", async () => {
    const result = await Extension.signIn("Test.123");
    expect(result).toBe(undefined);
  });

  it("should be signed up", async () => {
    const result = await Extension.alreadySignedUp();
    expect(result).toBe(true);
  });

  describe("areAccountsInitialized", () => {
    it("should true", async () => {
      const Accounts = await import("./storage/entities/Accounts");
      Accounts.default.get = vi.fn().mockReturnValue({
        data: {
          "EVM-1234": {
            type: AccountType.EVM,
          },
        },
      });

      const result = await Extension.areAccountsInitialized();
      expect(result).toBe(true);
    });

    it("should return false", async () => {
      const Accounts = await import("./storage/entities/Accounts");
      Accounts.default.get = vi.fn().mockReturnValue(undefined);

      const result = await Extension.areAccountsInitialized();
      expect(result).toBe(false);
    });

    it("should return with catch error false", async () => {
      const Accounts = await import("./storage/entities/Accounts");
      Accounts.default.get = vi.fn().mockRejectedValue(undefined);

      try {
        await Extension.areAccountsInitialized();
      } catch (error) {
        expect(error).toBe(false);
      }
    });
  });

  it("should sign out", async () => {
    const result = await Extension.signOut();
    expect(result).toBe(undefined);
  });

  it("should session be active", async () => {
    const result = await Extension.isSessionActive();
    expect(result).toBe(true);
  });

  describe("showKey", () => {
    it("should return key", async () => {
      const SelectedAccount = (
        await import("./storage/entities/SelectedAccount")
      ).default;
      SelectedAccount.get = vi.fn().mockReturnValue({
        value: {
          type: AccountType.EVM,
          address: "EVM-1234",
          keyring: "EVM",
        },
      });

      const Vault = (await import("./storage/entities/Vault")).default;
      Vault.getKeyring = vi.fn().mockReturnValue({
        getKey: () => {
          return "1234";
        },
      });

      const result = await Extension.showKey();
      expect(result).toBe("1234");
    });

    it("should return undefined", async () => {
      const SelectedAccount = (
        await import("./storage/entities/SelectedAccount")
      ).default;
      SelectedAccount.get = vi.fn().mockReturnValue(undefined);

      const result = await Extension.showKey();
      expect(result).toBe(undefined);
    });
  });

  it("get account", async () => {
    const result = await Extension.getAccount("EVM-1234");
    expect(result).toBe(undefined);
  });

  describe("getAllAccounts", () => {
    it("should return all accounts", async () => {
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

  it("should derive account", async () => {
    const result = await Extension.deriveAccount(
      "derived-evm",
      AccountType.EVM
    );
    expect(result).toMatchObject({
      key: "WASM-123",
      value: "0x123",
      type: AccountType.WASM,
    });
  });

  it("should set network", async () => {
    const result = await Extension.setNetwork(selectedWASMChainMock);
    expect(result).toBe(true);
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

  it("should get network", async () => {
    const _Network = (await import("./storage/entities/Network")).default;
    const get = vi.fn();
    _Network.get = get;

    Extension.getNetwork();

    expect(get).toHaveBeenCalled();
  });

  describe("getGeneralSettings", () => {
    it("should return general settings", async () => {
      const _Settings = (await import("./storage/entities/settings/Settings"))
        .default;
      const get = vi.fn().mockReturnValue(getSettingsMock);
      _Settings.get = get;

      const result = await Extension.getGeneralSettings();
      expect(result).toMatchObject(getSettingsMock.getAll());
    });

    it("should return error", async () => {
      const _Settings = (await import("./storage/entities/settings/Settings"))
        .default;
      const get = vi.fn().mockReturnValue(undefined);
      _Settings.get = get;

      try {
        await Extension.getGeneralSettings();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_settings");
      }
    });
  });

  describe("getAdvancedSettings", () => {
    it("should return general settings", async () => {
      const _Settings = (await import("./storage/entities/settings/Settings"))
        .default;
      const get = vi.fn().mockReturnValue(getSettingsMock);
      _Settings.get = get;

      const result = await Extension.getAdvancedSettings();
      expect(result).toMatchObject(getSettingsMock.getAll());
    });

    it("should return error", async () => {
      const _Settings = (await import("./storage/entities/settings/Settings"))
        .default;
      const get = vi.fn().mockReturnValue(undefined);
      _Settings.get = get;

      try {
        await Extension.getAdvancedSettings();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_settings");
      }
    });
  });

  describe("getSetting", () => {
    it("should return general settings", async () => {
      const _Settings = (await import("./storage/entities/settings/Settings"))
        .default;
      const get = vi.fn().mockReturnValue(getSettingsMock);
      _Settings.get = get;

      const result = await Extension.getSetting(
        SettingType.GENERAL,
        SettingKey["LANGUAGES"]
      );
      expect(result).toMatchObject(getSettingsMock.get());
    });

    it("should return error", async () => {
      const _Settings = (await import("./storage/entities/settings/Settings"))
        .default;
      const get = vi.fn().mockReturnValue(undefined);
      _Settings.get = get;

      try {
        await Extension.getSetting(
          SettingType.GENERAL,
          SettingKey["LANGUAGES"]
        );
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_settings");
      }
    });
  });

  describe("updateSetting", () => {
    it("should return settings", async () => {
      const _Settings = (await import("./storage/entities/settings/Settings"))
        .default;

      const set = vi.fn();
      const update = vi.fn();
      const get = vi.fn().mockReturnValue({
        update,
        set,
      });
      _Settings.get = get;
      _Settings.set = set;

      await Extension.updateSetting(
        SettingType.GENERAL,
        SettingKey["LANGUAGES"],
        "en"
      );
      expect(set).toHaveBeenCalled();
    });

    it("should return error", async () => {
      const _Settings = (await import("./storage/entities/settings/Settings"))
        .default;

      const get = vi.fn().mockReturnValue(undefined);
      _Settings.get = get;

      try {
        await Extension.updateSetting(
          SettingType.GENERAL,
          SettingKey["LANGUAGES"],
          "en"
        );
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_settings");
      }
    });
  });

  describe("getContacts", () => {
    it("should return contacts", async () => {
      const _Registry = (await import("./storage/entities/registry/Registry"))
        .default;

      const get = vi.fn().mockReturnValue({
        getAllContacts: vi.fn().mockReturnValue(contactsMock),
      });
      _Registry.get = get;

      const result = await Extension.getContacts();
      expect(result).toMatchObject(contactsMock);
    });
    it("should return error", async () => {
      const _Registry = (await import("./storage/entities/registry/Registry"))
        .default;

      const get = vi.fn().mockReturnValue(undefined);
      _Registry.get = get;

      try {
        await Extension.getContacts();
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

      const _Registry = (await import("./storage/entities/registry/Registry"))
        .default;
      const get = vi.fn().mockReturnValue({
        getAllContacts: () => contactsMock,
        getRecentAddresses: () => [],
      });
      _Registry.get = get;

      const _Network = (await import("./storage/entities/Network")).default;
      const getNetwork = vi.fn().mockReturnValue({
        chain: {
          supportedAccounts: [],
        },
      });
      _Network.get = getNetwork;

      const _AccountManage = (await import("./accounts/AccountManager"))
        .default;
      const getAll = vi.fn().mockReturnValue({
        getAll: () => {
          return [];
        },
      });

      _AccountManage.getAll = getAll;

      const result = await Extension.getRegistryAddresses();
      expect(result.contacts).toMatchObject(contactsMock);
    });

    it("should return registry error", async () => {
      const _Registry = (await import("./storage/entities/registry/Registry"))
        .default;

      const get = vi.fn().mockReturnValue(undefined);
      _Registry.get = get;

      try {
        await Extension.getRegistryAddresses();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_registry");
      }
    });

    it("should return network error", async () => {
      const _Registry = (await import("./storage/entities/registry/Registry"))
        .default;
      const get = vi.fn().mockReturnValue({});
      _Registry.get = get;

      const _Network = (await import("./storage/entities/Network")).default;
      const getNetwork = vi.fn().mockReturnValue({ chain: undefined });
      _Network.get = getNetwork;

      try {
        await Extension.getRegistryAddresses();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_network");
      }
    });

    it("should return network error", async () => {
      const _Registry = (await import("./storage/entities/registry/Registry"))
        .default;
      const get = vi.fn().mockReturnValue({});
      _Registry.get = get;

      const _Network = (await import("./storage/entities/Network")).default;
      const getNetwork = vi.fn().mockReturnValue({
        chain: {
          supportedAccounts: [],
        },
      });
      _Network.get = getNetwork;

      const _AccountManage = (await import("./accounts/AccountManager"))
        .default;
      const getAll = vi.fn().mockReturnValue(undefined);

      _AccountManage.getAll = getAll;

      try {
        await Extension.getRegistryAddresses();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_accounts");
      }
    });
  });

  describe("save contact", () => {
    it("should save contact", async () => {
      const _Registry = (await import("./storage/entities/registry/Registry"))
        .default;
      const addContact = vi.fn();

      _Registry.addContact = addContact;

      await Extension.saveContact({
        name: "account1",
        address: "0x12345",
      });
      expect(addContact).toHaveBeenCalled();
    });
  });

  it("removeContact", async () => {
    const _Registry = (await import("./storage/entities/registry/Registry"))
      .default;
    const removeContact = vi.fn();
    _Registry.removeContact = removeContact;

    await Extension.removeContact("0x12345");
    expect(removeContact).toHaveBeenCalled();
  });

  it("getActivity", async () => {
    const _Activity = (await import("./storage/entities/activity/Activity"))
      .default;
    const getRecords = vi.fn();

    _Activity.getRecords = getRecords;

    await Extension.getActivity();
    expect(getRecords).toHaveBeenCalled();
  });

  describe("getAllChains", () => {
    it("should return all chains", async () => {
      const _Chains = (await import("./storage/entities/Chains")).default;

      const get = vi.fn().mockReturnValue(CHAINS);
      _Chains.get = get;

      const result = await Extension.getAllChains();
      expect(result).toMatchObject(CHAINS);
    });

    it("should return error", async () => {
      const _Chains = (await import("./storage/entities/Chains")).default;

      const get = vi.fn().mockReturnValue(undefined);
      _Chains.get = get;

      try {
        await Extension.getAllChains();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_chains");
      }
    });
  });

  it("saveCustomChain", async () => {
    const _Chains = (await import("./storage/entities/Chains")).default;

    const saveCustomChain = vi.fn();
    _Chains.saveCustomChain = saveCustomChain;

    Extension.saveCustomChain(CHAINS[0].chains[0]);
    expect(saveCustomChain).toHaveBeenCalled();
  });

  it("removeCustomChain", async () => {
    const _Chains = (await import("./storage/entities/Chains")).default;

    const removeCustomChain = vi.fn();
    _Chains.removeCustomChain = removeCustomChain;

    Extension.removeCustomChain(CHAINS[0].chains[0].name);
    expect(removeCustomChain).toHaveBeenCalled();
  });

  describe("getXCMChains", () => {
    it("should return xcm chains", async () => {
      const _Chains = (await import("./storage/entities/Chains")).default;

      const getByName = vi.fn().mockReturnValue({ xcm: ["moonbeam"] });
      const get = vi.fn().mockReturnValue({
        getAll: () => ({
          filter: vi.fn().mockReturnValue(CHAINS[0].chains),
        }),
      });
      _Chains.getByName = getByName;
      _Chains.get = get;

      const result = await Extension.getXCMChains(CHAINS[0].chains[0].name);
      expect(result).toMatchObject(CHAINS[0].chains);
    });

    it("should return chain error", async () => {
      const _Chains = (await import("./storage/entities/Chains")).default;

      const getByName = vi.fn().mockReturnValue({ xcm: undefined });
      _Chains.getByName = getByName;

      try {
        await Extension.getXCMChains(CHAINS[0].chains[0].name);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_chain");
      }
    });

    it("should return chains error", async () => {
      const _Chains = (await import("./storage/entities/Chains")).default;

      const getByName = vi.fn().mockReturnValue({ xcm: [] });
      const get = vi.fn().mockReturnValue(undefined);
      _Chains.getByName = getByName;
      _Chains.get = get;

      try {
        await Extension.getXCMChains(CHAINS[0].chains[0].name);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_get_chains");
      }
    });
  });

  it("addActivity", async () => {
    const _Activity = (await import("./storage/entities/activity/Activity"))
      .default;
    const addRecord = vi.fn();
    _Activity.addRecord = addRecord;

    const _Registry = (await import("./storage/entities/registry/Registry"))
      .default;
    const addRecent = vi.fn();
    _Registry.addRecentAddress = addRecent;

    await Extension.addActivity("0x1234", {} as Record);
    expect(addRecent).toHaveBeenCalled();
  });

  it("updateActivity", async () => {
    const _Activity = (await import("./storage/entities/activity/Activity"))
      .default;
    const updateRecordStatus = vi.fn();
    _Activity.updateRecordStatus = updateRecordStatus;

    await Extension.updateActivity("0x1234", RecordStatus.SUCCESS);
    expect(updateRecordStatus).toHaveBeenCalled();
  });

  it("addAsset", async () => {
    const _Assets = (await import("./storage/entities/Assets")).default;
    const addAsset = vi.fn();
    _Assets.addAsset = addAsset;

    await Extension.addAsset(
      CHAINS[0].chains[0].name,
      {} as unknown as { symbol: string; address: string; decimals: number }
    );
    expect(addAsset).toHaveBeenCalled();
  });

  it("getAssetsByChain", async () => {
    const _Assets = (await import("./storage/entities/Assets")).default;
    const getByChain = vi.fn();
    _Assets.getByChain = getByChain;

    await Extension.getAssetsByChain(CHAINS[0].chains[0].name);
    expect(getByChain).toHaveBeenCalled();
  });

  it("getTrustedSites", async () => {
    const _TrustedSites = (await import("./storage/entities/TrustedSites"))
      .default;
    const getAll = vi.fn();
    _TrustedSites.getAll = getAll;

    Extension.getTrustedSites();
    expect(getAll).toHaveBeenCalled();
  });

  it("addTrustedSite", async () => {
    const _TrustedSites = (await import("./storage/entities/TrustedSites"))
      .default;
    const addSite = vi.fn();
    _TrustedSites.addSite = addSite;

    Extension.addTrustedSite("https://test.com");
    expect(addSite).toHaveBeenCalled();
  });

  it("removeTrustedSite", async () => {
    const _TrustedSites = (await import("./storage/entities/TrustedSites"))
      .default;
    const removeSite = vi.fn();
    _TrustedSites.removeSite = removeSite;

    Extension.removeTrustedSite("https://test.com");
    expect(removeSite).toHaveBeenCalled();
  });
});
