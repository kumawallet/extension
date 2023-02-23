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
  MANAGE_NETWORKS = "manage_networks",
}
export type SettingValue = string | Language[] | number | boolean;
