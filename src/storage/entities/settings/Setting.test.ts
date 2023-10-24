import Setting from "./Setting";
import { SettingValue } from "./types";

describe("Setting", () => {
  it("should instance", async () => {
    const setting = new Setting("test", "test");
    expect(setting).toBeInstanceOf(Setting);
  });

  it("should format name", async () => {
    const setting = new Setting("test", "test");
    expect(setting.name).toBe("test");
  });

  it("should return string true", () => {
    const setting = new Setting("test", "test");
    expect(setting.isString()).toBeTruthy();
  });

  it("should return number", () => {
    const setting = new Setting("test", 1);
    expect(setting.isNumber()).toBeTruthy();
  });

  it("should return boolean", () => {
    const setting = new Setting("test", true);
    expect(setting.isBoolean()).toBeTruthy();
  });

  it("should return object", () => {
    const setting = new Setting("test", {} as SettingValue);
    expect(setting.isObject()).toBeTruthy();
  });

  it("should return language array", () => {
    const setting = new Setting("test", [{ lang: "test" }] as SettingValue);
    expect(setting.isLanguageArray()).toBeTruthy();
  });
  it("should return currency array", () => {
    const setting = new Setting("test", [{ symbol: "test" }] as SettingValue);
    expect(setting.isCurrencyArray()).toBeTruthy();
  });
});
