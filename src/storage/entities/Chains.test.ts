import Chains from "./Chains";
import { Chain } from "@src/types";

describe("Chains", () => {
  beforeAll(() => {
    vi.mock("@src/storage/entities/BaseEntity", () => {
      class BaseEntityMock {
        static get() {
          return Promise.resolve();
        }

        static set() {
          return Promise.resolve();
        }
      }

      return {
        default: BaseEntityMock,
      };
    });
  });

  it("should instance", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chains = new (Chains as any)();
    expect(chains).toBeInstanceOf(Chains);
  });

  describe("get instance", () => {
    it("should return instance", () => {
      const instance = Chains.getInstance();
      expect(instance).toBeInstanceOf(Chains);
    });

    it("should return same instance", () => {
      const instance = Chains.getInstance();
      const instance2 = Chains.getInstance();
      expect(instance).toBe(instance2);
    });
  });

  it("shoud init", () => {
    expect(Chains.init()).resolves.toBeUndefined();
  });

  it("should return default value", () => {
    const chains = Chains.getInstance();
    expect(Chains.getDefaultValue()).resolves.toEqual(chains);
  });

  describe("load chains", () => {
    it("should load chains", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      _BaseEntity.get = vi.fn().mockReturnValue({
        custom: [],
      });

      await Chains.loadChains();

      const chains = Chains.getInstance();
      expect(chains.custom).toEqual([]);
    });

    it("should throw error", async () => {
      // mock base entity
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      _BaseEntity.get = vi.fn().mockReturnValue(undefined);

      try {
        await Chains.loadChains();
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_load_chains");
      }
    });
  });

  describe("save custom chain", () => {
    it("should chain_already_added throw error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      _BaseEntity.get = vi.fn().mockReturnValue({
        custom: [],
        isAlreadyAdded: vi.fn().mockReturnValue(false),
      });
      const set = vi.fn();
      _BaseEntity.set = set;

      await Chains.saveCustomChain({ name: "test" } as Chain);

      expect(set).toHaveBeenCalled();
    });

    it("should throw failed_to_save_custom_chain error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      _BaseEntity.get = vi.fn().mockReturnValue(undefined);

      try {
        await Chains.saveCustomChain({ name: "test" } as Chain);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_save_custom_chain");
      }
    });

    it("should chain_already_added throw error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      _BaseEntity.get = vi.fn().mockReturnValue({
        isAlreadyAdded: vi.fn().mockReturnValue(true),
      });

      try {
        await Chains.saveCustomChain({ name: "test" } as Chain);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toBe("Error: chain_already_added");
      }
    });
  });

  describe("remove custom chain", () => {
    it("remove custom chain", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      _BaseEntity.get = vi.fn().mockReturnValue({
        custom: [],
        isAlreadyAdded: vi.fn().mockReturnValue(false),
      });
      const set = vi.fn();
      _BaseEntity.set = set;

      await Chains.removeCustomChain("test");

      expect(set).toHaveBeenCalled();
    });

    it("should throw error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      _BaseEntity.get = vi.fn().mockReturnValue(undefined);

      try {
        await Chains.removeCustomChain("test");
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_remove_custom_chain");
      }
    });
  });

  it("should get all", () => {
    const chains = Chains.getInstance();
    chains.custom = [
      {
        name: "test",
      } as Chain,
    ];

    expect(chains.custom).toEqual([{ name: "test" } as Chain]);
  });

  it("should already added", () => {
    const chains = Chains.getInstance();
    chains.custom = [
      {
        name: "test",
      } as Chain,
    ];

    expect(chains.isAlreadyAdded({ name: "test" } as Chain)).toBeTruthy();
  });
});
