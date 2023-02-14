import { SettingValue } from "./Settings";

export default class Setting {
    value: SettingValue;
    name: string;
  
    constructor(name: string, value: SettingValue) {
      this.value = value;
      this.name = Setting.format(name);
    }
  
    private static format(name: string) {
      return name
        .split(/(?=[A-Z])/)
        .join("_")
        .toLowerCase();
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