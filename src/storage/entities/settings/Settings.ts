import BaseEntity from "../BaseEntity";
import LanguageSetting from "./LanguageSetting";
import Setting from "./Setting";
import { SettingKey, SettingType, SettingValue } from "./types";

export default class Settings extends BaseEntity {
  data: {
    general: { [key: string]: Setting };
    advanced: { [key: string]: Setting };
    security: { [key: string]: Setting };
  };

  constructor() {
    super();
    this.data = {
      general: {},
      advanced: {},
      security: {},
    };
  }

  static async init() {
    const settings = new Settings();
    settings.addToGeneral(
      SettingKey.LANGUAGES,
      LanguageSetting.getSupportedLanguages()
    );
    await Settings.set(settings);
  }

  isEmpty() {
    return Object.keys(this.data).length === 0;
  }

  addToGeneral(key: SettingKey, value: SettingValue) {
    const setting = new Setting(key, value);
    this.data.general[key] = setting;
  }

  addToAdvanced(key: SettingKey, value: Setting) {
    this.data.advanced[key] = value;
  }

  addToSecurity(key: SettingKey, value: Setting) {
    this.data.security[key] = value;
  }

  getFromGeneral(key: SettingKey) {
    return this.get(SettingType.GENERAL, key);
  }

  getFromAdvanced(key: SettingKey) {
    return this.get(SettingType.ADVANCED, key);
  }

  getFromSecurity(key: SettingKey) {
    return this.get(SettingType.SECURITY, key);
  }

  get(type: SettingType, key: SettingKey) {
    if (!this.data[type][key]) return undefined;
    return new Setting(key, this.data[type][key].value);
  }

  async getAll(type: SettingType): Promise<Setting[]> {
    return Object.keys(this.data[type]).map(
      (key) => new Setting(key, this.data[type][key].value)
    );
  }

  update(type: SettingType, key: SettingKey, value: SettingValue) {
    this.data[type][key].value = value;
  }

  allreadyExists(type: SettingType, key: SettingKey) {
    return this.data[type][key] !== undefined;
  }
}
