export type Language = {
    lang: string;
    name: string;
    englishName: string;
};
export type Currency = {
    symbol: string;
    name: string;
};


export enum SettingType {
    GENERAL = "general",
    ADVANCED = "advanced",
    SECURITY = "security",
}

export enum SettingKey {
    LANGUAGES = "languages",
    MANAGE_NETWORKS = "manage_networks",
    SHOW_TESTNETS = "show_testnets",
    CURRENCY = "currency",
}

export type SettingValue = string | Language[] | number | boolean | Currency[];
