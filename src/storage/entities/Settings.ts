import { SETTINGS } from "../../utils/constants";
import Storable from "../Storable";

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

export class Setting {
  value: SettingValue;
  name: string;

  constructor(name: string, value: SettingValue) {
    this.value = value;
    this.name = Setting.format(name);
  }

  private static format(name: string) {
    return name.split(/(?=[A-Z])/).join("_").toLowerCase();
  }

  isString() {
    return typeof this.value === "string";
  }

  isNumber() {
    return typeof this.value === "number";
  }

  isBoolean() {
    return typeof this.value === "boolean";
  }

  isObject() {
    return typeof this.value === "object";
  }

  isLanguageArray() {
    if (this.isObject()) {
      const lang = this.value as Language[];
      return lang.length > 0 && lang[0].lang !== undefined;
    }
  }
}

export class LanguageSetting extends Setting {

  static getDefault() {
    return { lang: "en", name: "English", englishName: "English" };
  }

  static getSupportedLanguages() {
    return [
      { lang: "en", name: "English", englishName: "English" },
      { lang: "es", name: "Español", englishName: "Spanish" },
      { lang: "jp", name: "日本語", englishName: "Japanese" },
    ];
  }
}

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

  static init() {
    const settings = new Settings();
    settings.addToGeneral(
      SettingKey.LANGUAGES,
      LanguageSetting.getSupportedLanguages()
    );
    return settings;
  }
}
