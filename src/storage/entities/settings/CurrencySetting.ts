import {CURRENCIES} from "@src/utils/constants";
import Setting from "./Setting";

export default class CurrencySetting extends Setting {
    static getDefault() {
        return CURRENCIES[0];
    }

    static getCurrencies() {
        return CURRENCIES;
    }
}