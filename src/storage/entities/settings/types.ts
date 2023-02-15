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
