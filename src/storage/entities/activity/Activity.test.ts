import { Transaction } from "@src/types";
import Activity from "./Activity";
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

      await Activity.addRecord("WASM-0x123", "0x123", {} as Transaction);
      expect(set).toHaveBeenCalled();
    });

    it("should throw Activity.get error", async () => {
      const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
        .default;
      const get = vi.fn();
      _BaseEntity.get = get;

      try {
        await Activity.addRecord("WASM-0x123", "0x123", {} as Transaction);
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_add_record");
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
          "WASM-0x123": {
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

      await Activity.updateRecordStatus("WASM-0x123", "0x1234", {
        status: RecordStatus.PENDING,
        fee: "",
      });
      expect(set).toHaveBeenCalled();
    });

    it("should throw SelectedAccount.get error", async () => {
      const _SelectedAccount = (
        await import("@src/storage/entities/SelectedAccount")
      ).default;

      const get2 = vi.fn().mockReturnValue({ key: undefined });
      _SelectedAccount.get = get2;

      try {
        await Activity.updateRecordStatus("WASM-0x123", "0x1234", {
          status: RecordStatus.PENDING,
          fee: "",
        });
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
        await Activity.updateRecordStatus("WASM-0x123", "0x1234", {
          status: RecordStatus.PENDING,
          fee: "",
        });
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
          "WASM-0x123": {},
        },
      });
      _BaseEntity.get = get;

      try {
        await Activity.updateRecordStatus("WASM-0x123", "0x1234", {
          fee: "",
          status: RecordStatus.PENDING,
        });
      } catch (error) {
        expect(String(error)).toBe("Error: failed_to_update_record_status");
      }
    });
  });

  it("add record", () => {
    const activity = new Activity();
    activity.addRecord("EVM-0x123", "0x123", {
      status: RecordStatus.PENDING,
    } as Transaction);
    expect(activity.data).toEqual({
      "EVM-0x123": {
        "0x123": {
          status: RecordStatus.PENDING,
        },
      },
    });
  });

  it("get records", async () => {
    const BaseEntity = (await import("@src/storage/entities/BaseEntity"))
      .default;
    BaseEntity.get = vi.fn().mockReturnValue({
      data: {
        "EVM-0x123": {
          "0x123": {
            id: "1",
            status: RecordStatus.PENDING,
            originNetwork: "test",
            targetNetwork: "test",
          },
        },
      },
    });

    const records = await Activity.getRecords({
      address: "EVM-0x123",
      networkNames: ["test"],
    });

    expect(records).toEqual([
      {
        id: "1",
        status: RecordStatus.PENDING,
        originNetwork: "test",
        targetNetwork: "test",
      },
    ]);
  });
});
