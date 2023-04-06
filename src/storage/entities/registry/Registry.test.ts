import Contact from "./Contact";
import Registry from "./Registry";

describe("Registry", () => {
  beforeAll(() => {
    vi.mock("@src/storage/entities/BaseEntity", () => {
      class BaseEntityMock {
        static get() {
          return vi.fn();
        }

        static set() {
          return vi.fn();
        }
      }

      return {
        default: BaseEntityMock,
      };
    });
  });

  it("should instance", () => {
    const registry = new Registry();
    expect(registry).toBeInstanceOf(Registry);
  });

  it("shoud get default value", async () => {
    expect(Registry.getDefaultValue()).resolves.toBeInstanceOf(Registry);
  });

  it("should init", async () => {
    expect(Registry.init()).resolves.toBeUndefined();
  });

  describe("add contact", () => {
    it("should add contact", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue({
        addContact: vi.fn(),
        data: { contacts: { test: { address: "test" } } },
      });

      _BaseEntity.get = get;

      expect(
        Registry.addContact({ address: "test" } as Contact)
      ).resolves.toBeUndefined();
    });

    it("should throw error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue(undefined);

      _BaseEntity.get = get;
      expect(
        Registry.addContact({ address: "test" } as Contact)
      ).rejects.toThrowError();
    });
  });

  describe("get contact", () => {
    it("should get contact", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue({
        getContact: vi.fn().mockReturnValue({
          address: "test",
        }),
        data: { contacts: { test: { address: "test" } } },
      });
      _BaseEntity.get = get;

      expect(Registry.getContact("test")).resolves.toEqual({ address: "test" });
    });

    it("should throw error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;

      const get = vi.fn().mockReturnValue(undefined);
      _BaseEntity.get = get;

      expect(Registry.getContact("test")).rejects.toThrowError(
        "failed_to_get_contact"
      );
    });
  });

  describe("change contact name", () => {
    it("should change contact name", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue({
        getContact: vi.fn().mockReturnValue({
          name: "",
        }),
        data: { contacts: { test: { address: "test" } } },
      });
      const set = vi.fn();
      _BaseEntity.get = get;
      _BaseEntity.set = set;

      await Registry.changeContactName("test", "test");
      expect(set).toHaveBeenCalled();
    });

    it("should throw registry error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;

      const get = vi.fn().mockReturnValue(undefined);
      _BaseEntity.get = get;

      expect(Registry.changeContactName("test", "test")).rejects.toThrowError(
        "failed_to_change_contact_name"
      );
    });

    it("should throw contract error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;

      const get = vi.fn().mockReturnValue({
        getContact: vi.fn().mockReturnValue(undefined),
        data: { contacts: { test: { address: "test" } } },
      });
      _BaseEntity.get = get;

      expect(Registry.changeContactName("test", "test")).rejects.toThrowError(
        "contact_not_found"
      );
    });
  });

  describe("remove contact", () => {
    it("should remove contact", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue({
        getContact: vi.fn().mockReturnValue({
          name: "",
        }),
        removeContact: vi.fn(),
        data: { contacts: { test: { address: "test" } } },
      });

      const set = vi.fn();
      _BaseEntity.get = get;
      _BaseEntity.set = set;

      await Registry.removeContact("test");
      expect(set).toHaveBeenCalled();
    });

    it("should throw registry error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;

      const get = vi.fn().mockReturnValue(undefined);
      _BaseEntity.get = get;

      expect(Registry.removeContact("test")).rejects.toThrowError(
        "failed_to_remove_contact"
      );
    });
  });

  describe("add recent", () => {
    it("should add recent", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue({
        getContact: vi.fn().mockReturnValue({
          name: "",
        }),
        addRecent: vi.fn(),
        data: { contacts: { test: { address: "test" } } },
      });
      const set = vi.fn();
      _BaseEntity.get = get;
      _BaseEntity.set = set;
      await Registry.addRecent("test", {
        address: "",
        timestamp: 0,
      });
      expect(set).toHaveBeenCalled();
    });
    it("should throw registry error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue(undefined);
      _BaseEntity.get = get;
      expect(
        Registry.addRecent("test", {
          address: "",
          timestamp: 0,
        })
      ).rejects.toThrowError("failed_to_add_recent");
    });
  });

  describe("get recent", () => {
    it("should get recent", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue({
        getContact: vi.fn().mockReturnValue({
          name: "",
        }),
        getRecent: vi.fn().mockReturnValue([]),
        data: { contacts: { test: { address: "test" } } },
      });
      _BaseEntity.get = get;
      expect(Registry.getRecent("test")).resolves.toEqual([]);
    });
    it("should throw registry error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue(undefined);
      _BaseEntity.get = get;
      expect(Registry.getRecent("test")).rejects.toThrowError(
        "failed_to_get_recent"
      );
    });
  });

  it("should add contact", () => {
    const registry = new Registry();

    registry.addContact({ address: "test" } as Contact);
    expect(registry.data.contacts).toEqual({ test: { address: "test" } });
  });

  it("get contact", () => {
    const registry = new Registry();

    registry.addContact({ address: "test" } as Contact);
    expect(registry.getContact("test")).toEqual({ address: "test" });
  });

  it("add recent", () => {
    const registry = new Registry();

    registry.addContact({ address: "test" } as Contact);
    registry.addRecent("test", {
      address: "",
      timestamp: 0,
    });
    expect(registry.data.contacts).toEqual({
      test: { address: "test" },
    });
  });

  it("get recent", () => {
    const registry = new Registry();

    registry.addContact({ address: "test" } as Contact);
    expect(registry.getRecent("test")).toEqual([]);
  });

  it("get all contacts", () => {
    const registry = new Registry();

    registry.addContact({ address: "test" } as Contact);
    expect(registry.getAllContacts()).toEqual([{ address: "test" }]);
  });
});
