import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { General } from "./General";
import i18n from "@src/utils/i18n";
import Setting from "@src/storage/entities/settings/Setting";
import { SettingKey } from "@src/storage/entities/settings/types";

const getGeneralSettings = vi.fn().mockReturnValue([
  {
    name: SettingKey.LANGUAGES,
    isLanguageArray: () => true,
    value: [
      {
        name: "English",
        englishName: "English",
        lang: "en",
      },
      {},
    ],
  },
  {
    name: SettingKey.CURRENCY,
    isCurrencyArray: () => true,
    value: [
      {
        symbol: "usd",
        name: "US Dollar ($)",
      },
      {},
    ],
  },
  {
    name: SettingKey.SHOW_TESTNETS,
    value: false,
  },
  {
    name: SettingKey.MANAGE_NETWORKS,
  },
] as unknown as Setting[]);
const updateSetting = vi.fn();
const navigate = vi.fn();

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <General />
    </I18nextProvider>
  );
};

describe("General", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => () => navigate(),
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getGeneralSettings: () => getGeneralSettings(),
        updateSetting: () => updateSetting(),
      },
    }))

    vi.mock("@src/storage/entities/BaseEntity", () => ({
      default: class BaseEntity {
        constructor() { }
      }
    }))
  });

  it("should render", async () => {

    const { getByTestId } = renderComponent();
    await waitFor(() => {
      expect(getByTestId("language-select")).toBeDefined();
    }, {
      timeout: 10000
    });
  });


  // it('should call "manage networks"', async () => {
  //   const { getByTestId } = renderComponent();

  //   await waitFor(() => {
  //     expect(getByTestId("manage-networks-button")).toBeDefined();
  //   });

  //   const button = getByTestId("manage-networks-button");
  //   act(() => {
  //     fireEvent.click(button);
  //   });

  //   await waitFor(() => {
  //     expect(navigate).toHaveBeenCalled();
  //   });
  // });
});
