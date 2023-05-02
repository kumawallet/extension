import { AccountKey, AccountType, AccountValue } from "@src/accounts/types";
import Accounts from "./Accounts";

const accountMock = {
  key: "EVM-12345" as AccountKey,
  type: AccountType.EVM,
  value: {
    name: "derived evm",
    address: "0x12345",
    keyring: "EVM" as AccountType,
  },
};

const remove = vi.fn();
const add = vi.fn();

describe("Account", () => {
  beforeAll(() => {
    vi.mock("./Account", () => {
      class AccountMock {
        key: AccountKey;
        value: AccountValue;
        type: AccountType;

        constructor(key: AccountKey, value: AccountValue) {
          this.key = key;
          this.value = value;
          this.type = key.split("-")[0] as AccountType;
        }
      }

      return {
        default: AccountMock,
      };
    });
    vi.mock("./Network", () => ({
      default: {},
    }));
    vi.mock("./CacheAuth", () => ({
      default: {},
    }));
    vi.mock("./Vault", () => ({
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
        static set() {
          return "";
        }
        static get() {
          return {
            update: vi.fn(),
            remove: () => remove(),
            alreadyExists: () => false,
            add: () => add(),
          };
        }
      }
      return {
        default: baseEntityMock,
      };
    });
  });

  it("should instance", () => {
    const accounts = new Accounts();
    expect(accounts).toMatchObject({
      data: {},
    });
  });

  it("should init", async () => {
    const accounts = await Accounts.init();
    expect(accounts).toBe(undefined);
  });

  it("should update", async () => {
    const account = await Accounts.update(accountMock);
    expect(account).toMatchObject(accountMock);
  });

  describe("removeAccout", () => {
    it("should remove account", async () => {
      await Accounts.removeAccount(accountMock.key);
      expect(remove).toHaveBeenCalled();
    });

    it("should return error", async () => {
      const BaseEntity = await import("./BaseEntity");
      BaseEntity.default.get = vi.fn().mockReturnValue(undefined);

      try {
        await Accounts.removeAccount(accountMock.key);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_remove_account");
      }
    });
  });

  describe("add", () => {
    it("should add account", async () => {
      const BaseEntity = await import("./BaseEntity");
      BaseEntity.default.get = vi.fn().mockReturnValue({
        alreadyExists: () => false,
        add: () => add(),
      });

      await Accounts.save(accountMock);
      expect(add).toHaveBeenCalled();
    });

    it("should return  failed_to_add_account error", async () => {
      const BaseEntity = await import("./BaseEntity");
      BaseEntity.default.get = vi.fn().mockReturnValue(undefined);

      try {
        await Accounts.save(accountMock);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_add_account");
      }
    });

    it("should return  failed_to_add_account error", async () => {
      const BaseEntity = await import("./BaseEntity");
      BaseEntity.default.get = vi.fn().mockReturnValue({
        alreadyExists: () => true,
      });

      try {
        await Accounts.save(accountMock);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: account_already_exists");
      }
    });
  });

  it("should return isEmpty as true", () => {
    const accounts = new Accounts();
    const response = accounts.isEmpty();
    expect(response).toBe(true);
  });

  it("should add account", () => {
    const accounts = new Accounts();
    accounts.add(accountMock);
    expect(accounts.data).toMatchObject({
      [accountMock.key]: accountMock,
    });
  });

  it("should remove account", () => {
    const accounts = new Accounts();
    accounts.add(accountMock);
    accounts.remove(accountMock.key);
    expect(accounts.data).toMatchObject({});
  });

  describe("get", () => {
    it("should return account value by key", () => {
      const accounts = new Accounts();
      accounts.add(accountMock);
      const response = accounts.get(accountMock.key);
      expect(response).toMatchObject(accountMock);
    });

    it("should return undefined", () => {
      const accounts = new Accounts();
      const response = accounts.get(accountMock.key);
      expect(response).toMatchObject({});
    });
  });

  it("should getAll", () => {
    const accounts = new Accounts();
    accounts.add(accountMock);
    const response = accounts.getAll();
    expect(response).toEqual([accountMock]);
  });

  it("should update", () => {
    const newValue: AccountValue = {
      address: "0x789",
      keyring: "EVM" as AccountType,
      name: "imported-evm",
    };

    const accounts = new Accounts();
    accounts.add(accountMock);
    accounts.update(accountMock.key, newValue);
    const response = accounts.get(accountMock.key);
    expect(response).toMatchObject({
      ...accountMock,
      value: newValue,
    });
  });

  it("should return false alreadyExists", () => {
    const accounts = new Accounts();
    const response = accounts.alreadyExists(accountMock.key);
    expect(response).toBe(false);
  });

  describe("first", () => {
    it("should return first account", () => {
      const accounts = new Accounts();
      const response = accounts.first();
      expect(response).toBe(undefined);
    });
    it("should return undefined", () => {
      const accounts = new Accounts();
      accounts.add(accountMock);

      const response = accounts.first();
      expect(response).toMatchObject(accountMock);
    });
  });
});
