import CacheAuth from "./CacheAuth";

describe("CacheAuth", () => {
  beforeAll(() => {
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

  describe("hasExpired", () => {
    it("should return hasExpired as false", async () => {
      CacheAuth.getInstance().timeout = new Date().getTime() * 2;
      CacheAuth.getInstance().isUnlocked = true;
      const result = await CacheAuth.hasExpired();
      expect(result).toBe(false);
    });

    it("should return hasExpired as true", async () => {
      CacheAuth.getInstance().timeout = new Date().getTime() - 1000;
      CacheAuth.getInstance().isUnlocked = true;
      const result = await CacheAuth.hasExpired();
      expect(result).toBe(true);
    });
  });

  describe("unlock", () => {
    it("should unlock", async () => {
      await CacheAuth.unlock();
      expect(CacheAuth.getInstance().isUnlocked).toBe(true);
      expect(CacheAuth.getInstance().timeout).toBeGreaterThan(0);
    });
  });
});
