export const ACCOUNT_PATH = `m/44'/60'/0'/0/0`;

export const PASSWORD_REGEX =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
export const PRIVATE_KEY_OR_SEED_REGEX =
  /^(0x)?[0-9a-fA-F]{64}|^([a-zA-Z]+ )+[a-zA-Z]+$/;

export const LANGUAGES = [
  { lang: "en", name: "English", englishName: "English", flag: "🇺🇸" },
  { lang: "es", name: "Español", englishName: "Spanish", flag: "🇪🇸" },
  { lang: "jp", name: "日本語", englishName: "Japanese", flag: "🇯🇵" },
  { lang: "it", name: "Italiano", englishName: "Italian", flag: "🇮🇹" },
];
