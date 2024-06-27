import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { SelectAccountActivity } from "./SelectAccountActivity";
import { ACCOUNTS_MOCKS, EVM_ACCOUNT_MOCK } from "@src/tests/mocks/account-mocks";

const functionsMock = {
  onChangeValue: vi.fn(),
}

const dataMock = {
  selectedAddress: EVM_ACCOUNT_MOCK.value?.address as string,
}

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <SelectAccountActivity
        onChangeValue={functionsMock.onChangeValue}
        selectedAddress={dataMock.selectedAddress}
      />
    </I18nextProvider>
  );
};

describe("SelectAccountActivity", () => {
  beforeAll(() => {

    vi.mock("@src/providers", () => ({
      useAccountContext: () => ({
        state: {
          selectedAccount: null,
          accounts: ACCOUNTS_MOCKS,
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

    const firstAccount = getByTestId("filtered-items-container").children[1];

    fireEvent.click(firstAccount);

    await waitFor(() => {
      expect(functionsMock.onChangeValue).toHaveBeenCalledWith(EVM_ACCOUNT_MOCK.value?.address as string);
    });
  });

})
