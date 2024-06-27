import { fireEvent, render, waitFor } from "@testing-library/react";
import { Receive } from "./Receive";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { EVM_ACCOUNT_MOCK } from "@src/tests/mocks/account-mocks";
import { cropAccount } from "@src/utils/account-utils";

const functionMock = {
  navigate: vi.fn(),
  copyToClipboard: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Receive />
    </I18nextProvider>
  );
};

describe("Receive", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => functionMock.navigate,
    }));

    vi.mock("@src/providers", () => ({
      useAccountContext: () => ({
        state: {
          selectedAccount: EVM_ACCOUNT_MOCK,
        },
      }),
    }));

    vi.mock("@src/hooks", () => ({
      useCopyToClipboard: () => ({
        Icon: () => null,
        copyToClipboard: () => functionMock.copyToClipboard(),
      }),
    }));
  });

  it("should render", async () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("account-button")).toBeDefined();

    await waitFor(() => {
      expect(getByTestId("cropped-account").innerHTML).toBe(
        cropAccount(EVM_ACCOUNT_MOCK.value!.address)
      );
    });
  });

  it("should copy to clipboard", () => {
    const { getByTestId } = renderComponent();
    const accountButton = getByTestId("account-button");

    fireEvent.click(accountButton);

    expect(functionMock.copyToClipboard).toHaveBeenCalled();
  });

  it("should navigate back", () => {
    const { getByTestId } = renderComponent();
    const backButton = getByTestId("back-button");

    fireEvent.click(backButton);

    expect(functionMock.navigate).toHaveBeenCalledWith(-1);
  });
});
