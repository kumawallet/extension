import BaseEntity from "./BaseEntity";

const mockData = {
  vault: "data",
  vault2: "data",
};

describe("BaseEntity", () => {
  beforeAll(() => {
    vi.mock("../Storage.ts");

    vi.mock("./Accounts", () => ({
      default: {},
    }));
    vi.mock("./Account", () => ({
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
    vi.mock("./Network", () => ({
      default: {},
    }));
  });

  it("should init", async () => {
    const result = await BaseEntity.init();
    expect(result).toBe(undefined);
  });

  it("getDefaultValue", async () => {
    const result = await BaseEntity.getDefaultValue();
    expect(result).toBe(undefined);
  });

  it("fromData", async () => {
    const result = await BaseEntity.fromData(mockData);
    expect(result).toMatchObject(mockData);
  });

  describe("get", () => {
    it("should return stored data", async () => {
      const Storage = await import("../Storage");
      Storage.default.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => ({
            BaseEntity: mockData,
          }),
        },
      }));

      const result = await BaseEntity.get();
      expect(result).toMatchObject(mockData);
    });

    it("should return undefined", async () => {
      const Storage = await import("../Storage");
      Storage.default.getInstance = vi.fn().mockImplementation(() => ({
        storage: {
          get: () => undefined,
        },
      }));

      const result = await BaseEntity.get();
      expect(result).toBe(undefined);
    });
  });

  it("set", async () => {
    const set = vi.fn();

    const Storage = await import("../Storage");
    Storage.default.getInstance = vi.fn().mockImplementation(() => ({
      storage: {
        set,
      },
    }));

    await BaseEntity.set(mockData);
    expect(set).toHaveBeenCalled();
  });

  it("remove", async () => {
    const remove = vi.fn();

    const Storage = await import("../Storage");
    Storage.default.getInstance = vi.fn().mockImplementation(() => ({
      storage: {
        remove,
      },
    }));

    await BaseEntity.remove();
    expect(remove).toHaveBeenCalled();
  });
});
