import { LANGUAGES } from "@src/utils/constants";
import Setting from "./Setting";

export default class LanguageSetting extends Setting {
  static getDefault() {
    return LANGUAGES[0];
  }

  static getSupportedLanguages() {
    return LANGUAGES;
  }
}
