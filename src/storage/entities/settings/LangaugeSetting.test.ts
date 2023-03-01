import LanguageSetting from "./LanguageSetting";
import { LANGUAGES } from "@src/utils/constants";

describe("LanguageSettings", () => {
  beforeAll(() => {
    vi.mock("./Setting.ts", () => {
      class Setting {}

      return {
        default: Setting,
      };
    });
  });

  it("should get default language", () => {
    const result = LanguageSetting.getDefault();
    expect(result).toEqual(LANGUAGES[0]);
  });

  it("should get all languages", () => {
    const result = LanguageSetting.getSupportedLanguages();
    expect(result).toEqual(LANGUAGES);
  });
});
