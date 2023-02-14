import { SETTINGS } from "../../../utils/constants";
import Storable from "../../Storable";
import Storage from "../../Storage";
import LanguageSetting from "./LanguageSetting";
import Setting from "./Setting";

export type Language = {
  lang: string;
  name: string;
  englishName: string;
};

export enum SettingType {
  GENERAL = "general",
  ADVANCED = "advanced",
  SECURITY = "security",
}

export enum SettingKey {
  LANGUAGES = "languages",
}
export type SettingValue = string | Language[] | number | boolean;

export class Settings extends Storable {
  data: {
    general: { [key: string]: Setting };
    advanced: { [key: string]: Setting };
    security: { [key: string]: Setting };
  };

  constructor() {
    super(SETTINGS);
    this.data = {
      general: {},
      advanced: {},
      security: {},
    };
  }

  static init() {
    const settings = new Settings();
    settings.addToGeneral(
      SettingKey.LANGUAGES,
      LanguageSetting.getSupportedLanguages()
    );
    return settings;
  }

  static async get(): Promise<Settings | undefined> {
    const stored = await Storage.getInstance().get(SETTINGS);
    if (!stored) return undefined;
    const settings = new Settings();
    settings.set(stored.data);
    return settings;
  }

  static async set(settings: Settings) {
    await Storage.getInstance().set(SETTINGS, settings);
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

  set(settings: {
    general: { [key: string]: Setting };
    advanced: { [key: string]: Setting };
    security: { [key: string]: Setting };
  }) {
    this.data = settings;
  }

  update(type: SettingType, key: SettingKey, value: SettingValue) {
    this.data[type][key].value = value;
  }

  allreadyExists(type: SettingType, key: SettingKey) {
    return this.data[type][key] !== undefined;
  }
}
