import CurrencySetting from "./CurrencySetting";
import {CURRENCIES} from "@utils/constants";
import {expect} from "vitest";

describe("CurrencySettings",()=>{
    beforeAll(()=>{
        vi.mock("./Settings.ts",()=> {
            class Setting {}

            return {
                default:Setting,
            };
        });
    });
    it("should get default currency",()=>{
        const result = CurrencySetting.getDefault();
        expect(result).toEqual(CURRENCIES[0]);
    })
    it("should get all languages",()=>{
        const result = CurrencySetting.getCurrencies();
        expect(result).toEqual(CURRENCIES);
    })
})