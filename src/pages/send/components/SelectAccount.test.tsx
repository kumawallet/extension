import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { SelectAccount } from "./SelectAccount";
import { ChainType } from "@src/types";

const functionsMock = {
  onChangeValue: vi.fn(),
}

const dataMock = {
  selectedAddress: "0x1234567890",
}

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <SelectAccount
        onChangeValue={functionsMock.onChangeValue}
        selectedAddress={dataMock.selectedAddress}
      />
    </I18nextProvider>
  );
};

describe("SelectAccount", () => {
  beforeAll(() => {

    vi.mock("@src/providers", () => ({
      useAccountContext: () => ({
        state: {
          selectedAccount: null,
          accounts: [
            { value: { name: "Account 1", address: "0x1234567890" }, type: ChainType.EVM },
            { value: { name: "Account 2", address: "0x0987654321" }, type: ChainType.EVM },
          ],
        }
      })
    }))

  })

  it("should render", async () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId("select-account")).toBeDefined();
  });

  it("should select account", async () => {
    const { getByTestId } = renderComponent();

    fireEvent.click(getByTestId("select-account"));

    await waitFor(() => {
      expect(getByTestId("filtered-items-container")).toBeDefined();
    });

    const firstAccount = getByTestId("filtered-items-container").children[0];

    fireEvent.click(firstAccount);

    await waitFor(() => {
      expect(functionsMock.onChangeValue).toHaveBeenCalledWith("0x1234567890");
    });
  });

})
