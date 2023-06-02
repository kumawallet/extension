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
    name: SettingKey.SHOW_TESTNETS,
    value: false,
  },
  {
    name: SettingKey.MANAGE_NETWORKS,
  },
] as Setting[]);
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

    vi.mock("@src/Extension");
  });

  it("should render", async () => {
    const Extension = (await import("@src/Extension")).default;
    Extension.getGeneralSettings = getGeneralSettings;
    Extension.updateSetting = updateSetting;

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("language-select")).toBeDefined();
    });
  });

  it("should call showTestnets", async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("language-select")).toBeDefined();
    });

    await waitFor(() => {
      const checkBox = getByTestId("show-testnets-switch");
      expect(checkBox).toBeDefined();
    });

    const checkBox = getByTestId("show-testnets-switch");
    act(() => {
      fireEvent.click(checkBox);
    });

    await waitFor(() => {
      expect(updateSetting).toHaveBeenCalled();
    });
  });

  it('should call "manage networks"', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("manage-networks-button")).toBeDefined();
    });

    const button = getByTestId("manage-networks-button");
    act(() => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalled();
    });
  });
});
