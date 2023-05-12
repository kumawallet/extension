import TrustedSites from "./TrustedSites";

describe("Trusted Sites", () => {
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
    const trustedSites = new TrustedSites();
    expect(trustedSites).toBeInstanceOf(TrustedSites);
  });

  it("should get default value", async () => {
    const trustedSites = await TrustedSites.getDefaultValue();
    expect(trustedSites).toBeInstanceOf(TrustedSites);
  });

  it("should init", async () => {
    const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
      .default;

    const set = vi.fn();
    _BaseEntity.set = set;

    await TrustedSites.init();
    expect(set).toHaveBeenCalled();
  });

  describe("get all", () => {
    it("should get all", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;

      const get = vi.fn().mockReturnValue({ data: ["test"] });
      _BaseEntity.get = get;

      const trustedSites = await TrustedSites.getAll();
      expect(trustedSites).toEqual(["test"]);
    });

    it("should throw error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;

      const get = vi.fn().mockReturnValue(undefined);
      _BaseEntity.get = get;

      await expect(TrustedSites.getAll()).rejects.toThrow(
        "failed_to_get_trusted_sites"
      );
    });
  });

  describe("add site", () => {
    it("should add site", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;

      const get = vi.fn().mockReturnValue({ addSite: vi.fn() });
      _BaseEntity.get = get;

      const set = vi.fn();
      _BaseEntity.set = set;

      await TrustedSites.addSite("test");
      expect(set).toHaveBeenCalled();
    });

    it("should throw error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;

      const get = vi.fn().mockReturnValue(undefined);
      _BaseEntity.get = get;

      await expect(TrustedSites.addSite("test")).rejects.toThrow(
        "failed_to_add_trusted_site"
      );
    });
  });

  describe("remove site", () => {
    it("should remove site", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;

      const get = vi.fn().mockReturnValue({ removeSite: vi.fn() });
      _BaseEntity.get = get;

      const set = vi.fn();
      _BaseEntity.set = set;

      await TrustedSites.removeSite("test");
      expect(set).toHaveBeenCalled();
    });

    it("should throw error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;

      const get = vi.fn().mockReturnValue(undefined);
      _BaseEntity.get = get;

      await expect(TrustedSites.removeSite("test")).rejects.toThrow(
        "failed_to_remove_trusted_site"
      );
    });
  });

  describe("add site", () => {
    it("should add site", () => {
      const trustedSites = new TrustedSites();
      trustedSites.addSite("test");
      expect(trustedSites.data).toEqual(["test"]);
    });

    it("should throw error", () => {
      const trustedSites = new TrustedSites();
      trustedSites.data = ["test"];
      expect(() => trustedSites.addSite("test")).toThrow("site_already_added");
    });
  });

  describe("remove site", () => {
    it("should remove site", () => {
      const trustedSites = new TrustedSites();
      trustedSites.data = ["test"];
      trustedSites.removeSite("test");
      expect(trustedSites.data).toEqual([]);
    });

    it("should throw error", () => {
      const trustedSites = new TrustedSites();
      expect(() => trustedSites.removeSite("test")).toThrow("site_not_found");
    });
  });
});
