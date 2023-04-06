import Settings from "./Settings";
import { SettingKey, SettingType } from "./types";

describe("Settings", () => {
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

  it("should instance", async () => {
    const settings = new Settings();
    expect(settings).toBeInstanceOf(Settings);
  });

  it("should init", async () => {
    const _BaseEntity = (await import("@src/storage/entities/BaseEntity"))
      .default;
    const set = vi.fn();
    _BaseEntity.set = set;

    await Settings.init();
    expect(set).toHaveBeenCalled();
  });

  it("should be empty", () => {
    const settings = new Settings();
    expect(settings.isEmpty()).toBeFalsy();
  });

  it("should add to general", () => {
    const settings = new Settings();
    settings.addToGeneral(SettingKey.MANAGE_NETWORKS, "test");
    expect(settings.data.general[SettingKey.MANAGE_NETWORKS]).toBeDefined();
  });

  it("should add to advanced", () => {
    const settings = new Settings();
    settings.addToAdvanced(SettingKey.MANAGE_NETWORKS, "test");
    expect(settings.data.advanced[SettingKey.MANAGE_NETWORKS]).toBeDefined();
  });

  it("should add to security", () => {
    const settings = new Settings();
    settings.addToSecurity(SettingKey.MANAGE_NETWORKS, "test");
    expect(settings.data.security[SettingKey.MANAGE_NETWORKS]).toBeDefined();
  });

  it("should get from general", () => {
    const settings = new Settings();
    settings.addToGeneral(SettingKey.MANAGE_NETWORKS, "test");
    expect(settings.getFromGeneral(SettingKey.MANAGE_NETWORKS)).toBeDefined();
  });

  it("should get from advanced", () => {
    const settings = new Settings();
    settings.addToAdvanced(SettingKey.MANAGE_NETWORKS, "test");
    expect(settings.getFromAdvanced(SettingKey.MANAGE_NETWORKS)).toBeDefined();
  });

  it("should get from security", () => {
    const settings = new Settings();
    settings.addToSecurity(SettingKey.MANAGE_NETWORKS, "test");
    expect(settings.getFromSecurity(SettingKey.MANAGE_NETWORKS)).toBeDefined();
  });

  it("get", () => {
    const settings = new Settings();
    settings.addToSecurity(SettingKey.MANAGE_NETWORKS, "test");
    expect(
      settings.get(SettingType.SECURITY, SettingKey.MANAGE_NETWORKS)
    ).toBeDefined();
  });

  it("get all", () => {
    const settings = new Settings();
    settings.addToSecurity(SettingKey.MANAGE_NETWORKS, "test");
    expect(settings.getAll(SettingType.SECURITY)).toBeDefined();
  });

  it("update", () => {
    const settings = new Settings();
    settings.addToSecurity(SettingKey.MANAGE_NETWORKS, "test");

    settings.update(SettingType.SECURITY, SettingKey.MANAGE_NETWORKS, "test");

    expect(settings.getFromSecurity(SettingKey.MANAGE_NETWORKS)).toBeDefined();
  });

  it("allready exists", () => {
    const settings = new Settings();
    settings.addToSecurity(SettingKey.MANAGE_NETWORKS, "test");

    expect(
      settings.allreadyExists(SettingType.SECURITY, SettingKey.MANAGE_NETWORKS)
    ).toBeTruthy();
  });
});
