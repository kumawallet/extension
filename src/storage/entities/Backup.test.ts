import BackUp from "./BackUp";

const setMock = vi.fn();

describe("Backup", () => {
  beforeAll(() => {
    vi.mock("./BaseEntity.ts", () => {
      class BaseEntityMock {
        static set() {
          (() => setMock())();
        }
      }

      return {
        default: BaseEntityMock,
      };
    });
  });

  it("should instance", () => {
    const backup = new BackUp("password");
    expect(backup.data).toEqual("password");
  });

  it("should init", async () => {
    await BackUp.init();
    expect(setMock).toHaveBeenCalled();
  });
});
