import i18n from "@src/utils/i18n";
import { render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { ShowTestnets } from "./ShowTestnets";


const functionMocks = {
  updateSetting: vi.fn(),
  refreshNetworks: vi.fn()
}

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ShowTestnets validateSwitch={false} />
    </I18nextProvider>
  );
};

describe("ShowTestnets", () => {

  vi.mock("@src/messageAPI/api", () => ({
    messageAPI: {
      getSetting: vi.fn().mockResolvedValue({
        value: true
      }),
      updateSetting: () => functionMocks.updateSetting()
    }
  }))

  vi.mock("@src/providers", () => ({
    useNetworkContext: () => ({
      refreshNetworks: () => functionMocks.refreshNetworks()
    })
  }))

  it("should render", async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      expect(container).toBeDefined();
    })
  });

  it("should toggle", async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      const switchElement = getByTestId("show-testnets-switch");
      switchElement.click();

      expect(functionMocks.updateSetting).toHaveBeenCalled();
      expect(functionMocks.refreshNetworks).toHaveBeenCalled();
    })
  });


})