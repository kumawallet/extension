import Activity from "./Activity";
import Record from "./Record";
import { RecordStatus } from "./types";

describe("Activity", () => {
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

    // mock network
    vi.mock("@src/storage/entities/Network", () => {
      class NetworkMock {
        static get() {
          return Promise.resolve({
            chain: {
              name: "test",
            },
          });
        }
      }

      return {
        default: NetworkMock,
      };
    });

    // mock selected account
    vi.mock("@src/storage/entities/SelectedAccount", () => {
      class SelectedAccountMock {
        static get() {
          return Promise.resolve({
            key: "test",
          });
        }
      }

      return {
        default: SelectedAccountMock,
      };
    });
  });

  //
  it("shoud instance", () => {
    const activity = new Activity();
    expect(activity).toBeInstanceOf(Activity);
  });

  it("should init", () => {
    const activity = new Activity();
    expect(activity).toBeInstanceOf(Activity);
  });

  describe("addRecord", () => {
    it("should add record", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue({
        addRecord: vi.fn(),
      });
      const set = vi.fn();
      _BaseEntity.get = get;
      _BaseEntity.set = set;

      const _SelectedAccount = (
        await import("@src/storage/entities/SelectedAccount")
      ).default;

      const get2 = vi.fn().mockReturnValue({
        key: "test",
      });
      _SelectedAccount.get = get2;

      await Activity.addRecord("test", {} as Record);
      expect(set).toHaveBeenCalled();
    });
    it("should throw Activity.get error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn();
      _BaseEntity.get = get;

      try {
        await Activity.addRecord("test", {} as Record);
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_add_record");
      }
    });

    it("should throw SelectedAccount.get error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue({});
      _BaseEntity.get = get;

      const _SelectedAccount = (
        await import("@src/storage/entities/SelectedAccount")
      ).default;

      const get2 = vi.fn().mockReturnValue(undefined);
      _SelectedAccount.get = get2;

      try {
        await Activity.addRecord("test", {} as Record);
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_add_record");
      }
    });
  });

  describe("getRecords", () => {
    it("should throw SelectedAccount.get error", async () => {
      const _SelectedAccount = (
        await import("@src/storage/entities/SelectedAccount")
      ).default;

      const get2 = vi.fn().mockReturnValue({ key: undefined });
      _SelectedAccount.get = get2;

      try {
        await Activity.getRecords();
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_add_record");
      }
    });

    it("should throw Activity.get error", async () => {
      const _SelectedAccount = (
        await import("@src/storage/entities/SelectedAccount")
      ).default;

      const get2 = vi.fn().mockReturnValue({ key: "test" });
      _SelectedAccount.get = get2;

      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue(undefined);
      _BaseEntity.get = get;

      try {
        await Activity.getRecords();
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_get_records");
      }
    });

    it("should throw Activity.get error", async () => {
      const _SelectedAccount = (
        await import("@src/storage/entities/SelectedAccount")
      ).default;

      const get2 = vi.fn().mockReturnValue({ key: "test" });
      _SelectedAccount.get = get2;

      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue("test");
      _BaseEntity.get = get;

      const _Network = (await import("@src/storage/entities/Network")).default;
      _Network.get = vi.fn().mockReturnValue({ chain: undefined });

      try {
        await Activity.getRecords();
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_get_records");
      }
    });
  });

  describe("update record status", () => {
    it("should update record status", async () => {
      const _SelectedAccount = (
        await import("@src/storage/entities/SelectedAccount")
      ).default;

      const get2 = vi.fn().mockReturnValue({ key: "test" });
      _SelectedAccount.get = get2;

      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue({
        addRecord: vi.fn(),
        data: {
          test: {
            "0x1234": {
              status: RecordStatus.PENDING,
              error: "",
            },
          },
        },
      });
      const set = vi.fn();
      _BaseEntity.get = get;
      _BaseEntity.set = set;

      await Activity.updateRecordStatus(
        "0x1234",
        RecordStatus.PENDING,
        undefined
      );
      expect(set).toHaveBeenCalled();
    });

    it("should throw SelectedAccount.get error", async () => {
      const _SelectedAccount = (
        await import("@src/storage/entities/SelectedAccount")
      ).default;

      const get2 = vi.fn().mockReturnValue({ key: undefined });
      _SelectedAccount.get = get2;

      try {
        await Activity.updateRecordStatus(
          "0x1234",
          RecordStatus.PENDING,
          undefined
        );
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_add_record");
      }
    });

    it("should throw Activity.get error", async () => {
      const _SelectedAccount = (
        await import("@src/storage/entities/SelectedAccount")
      ).default;

      const get2 = vi.fn().mockReturnValue({ key: "test" });
      _SelectedAccount.get = get2;

      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue(undefined);
      _BaseEntity.get = get;

      try {
        await Activity.updateRecordStatus(
          "0x1234",
          RecordStatus.PENDING,
          undefined
        );
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_update_record_status");
      }
    });

    it("should throw activity.data error", async () => {
      const _SelectedAccount = (
        await import("@src/storage/entities/SelectedAccount")
      ).default;

      const get2 = vi.fn().mockReturnValue({ key: "test" });
      _SelectedAccount.get = get2;

      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn().mockReturnValue({
        data: {
          test: {},
        },
      });
      _BaseEntity.get = get;

      try {
        await Activity.updateRecordStatus(
          "0x1234",
          RecordStatus.PENDING,
          undefined
        );
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_update_record_status");
      }
    });
  });

  it("add record", () => {
    const activity = new Activity();
    activity.addRecord("EVM-0x123", "0x123", {
      status: RecordStatus.PENDING,
    } as Record);
    expect(activity.data).toEqual({
      "EVM-0x123": {
        "0x123": {
          status: RecordStatus.PENDING,
        },
      },
    });
  });
});
