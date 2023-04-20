import CacheAuth from "./CacheAuth";

describe("CacheAuth", () => {
  beforeAll(() => {
    // vi.mock("../Storage.ts", () => ({
    //   default: {
    //     getInstance: () => ({
    //       storage: {
    //         set: vi.fn(),
    //       },
    //     }),
    //   },
    // }));
    vi.mock("./Accounts", () => ({
      default: {},
    }));
    vi.mock("./Account", () => ({
      default: {},
    }));
    vi.mock("./Vault", () => ({
      default: {},
    }));
    vi.mock("./BackUp", () => ({
      default: {},
    }));
    vi.mock("../Auth", () => ({
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
    vi.mock("./Network", () => ({
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
          };
        }
      }
      return {
        default: baseEntityMock,
      };
    });
  });

  it("should instance", () => {
    const cacheAuth = CacheAuth.getInstance();
    expect(cacheAuth.isUnlocked).toBe(false);
    expect(cacheAuth.password).toBe(undefined);
    expect(cacheAuth.timeout).toBe(0);
  });

  it("shoud filled entity", async () => {
    const data = {
      key1: "value1",
      key2: "value2",
    };

    const result = await CacheAuth.fromData(data);
    expect(result).toMatchObject(data);
  });

  it("should save", () => {
    const password = "12345";

    CacheAuth["save"](password);
    const cacheAuth = CacheAuth.getInstance();
    expect(cacheAuth.isUnlocked).toBe(true);
    expect(cacheAuth.password).toBe(password);
    expect(cacheAuth.timeout).greaterThan(0);
  });

  describe("cachePassword", () => {
    it("should save in cache", async () => {
      const Storage = await import("../Storage");
      Storage.default.getInstance = vi.fn().mockReturnValue({
        getSalt: () => "salt",
      });

      const Auth = await import("../Auth");
      Auth.default.generateSaltedHash = vi.fn().mockReturnValue("encrypted");
      Auth.default.password = "12345";

      await CacheAuth.cachePassword();
      const cacheAuth = CacheAuth.getInstance();
      expect(cacheAuth.password).toBe("encrypted");
    });

    it("should return undefined", async () => {
      const Auth = await import("../Auth");
      Auth.default.password = undefined;

      const result = await CacheAuth.cachePassword();
      expect(result).toBe(undefined);
    });
  });

  describe("loadFromCache", () => {
    it("shoud call loadAuthFromCache function in Auth", async () => {
      const getSalt = vi.fn();
      const loadFromCache = vi.fn();

      const Storage = await import("../Storage");
      Storage.default.getInstance = vi.fn().mockReturnValue({
        getSalt,
      });

      const Auth = await import("../Auth");
      Auth.default.loadAuthFromCache = loadFromCache;

      await CacheAuth.loadFromCache();
      expect(getSalt).toHaveBeenCalled();
      expect(loadFromCache).toBeCalled();
    });
  });

  it("should clear instance", () => {
    CacheAuth.clear();
    CacheAuth["save"]("12345");
    CacheAuth.clear();
    const cacheAuth = CacheAuth.getInstance();

    expect(cacheAuth.password).toBe(undefined);
  });

  describe("hasExpired", () => {
    it("should return hasExpired as false", async () => {
      const cacheInstance = CacheAuth.getInstance();
      // AUDIT: caché expiration should be true when 0. Could lead to unexpected behaviour since it's not clear what 0 means.
      // AUDIT: also, when creating a new instance, the timeout is set to 0. This means that the cache is always expired.
      cacheInstance.timeout = 0;
      cacheInstance.isUnlocked = false;
      cacheInstance.password = undefined;

      const result = await CacheAuth.hasExpired();
      expect(result).toBe(false);
    });

    it("should return hasExpired as true", async () => {
      const cacheInstance = CacheAuth.getInstance();
      cacheInstance.timeout = new Date().getTime() / 2;
      cacheInstance.isUnlocked = true;
      cacheInstance.password = "12345";

      const result = await CacheAuth.hasExpired();
      expect(result).toBe(true);
    });
  });
});
