import Setting from "./Setting";

export default class LanguageSetting extends Setting {
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
