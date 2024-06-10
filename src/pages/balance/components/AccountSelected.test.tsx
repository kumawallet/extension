import { cropAccount } from "@src/utils/account-utils";
import i18n from "@src/utils/i18n";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { AccountSelected } from "./AccountSelected";
import { EVM_ACCOUNT_MOCK } from "@src/tests/mocks/account-mocks";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AccountSelected />
    </I18nextProvider>
  );
};

describe("AccountSelected", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useAccountContext: () => ({
        state: {
          selectedAccount: EVM_ACCOUNT_MOCK,
        },
      }),
    }));
  });

  it("should render selectedAccount", async () => {
    renderComponent();
    const account = screen.getByText(
      cropAccount(EVM_ACCOUNT_MOCK.value?.address as string, 8)
    );
    expect(account).toBeDefined();
  });

  it("should copy account", async () => {
    const copyText = vi.fn();

    window.navigator = {
      clipboard: {
        writeText: copyText,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    renderComponent();
    const button = screen.getByTestId("account-button");

    await act(() => {
      fireEvent.click(button);
    });

    expect(copyText).toHaveBeenCalled();
  });
});
