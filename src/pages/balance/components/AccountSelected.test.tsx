import { cropAccount } from "@src/utils/account-utils";
import i18n from "@src/utils/i18n";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { AccountSelected } from "./AccountSelected";

const renderCoponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AccountSelected />
    </I18nextProvider>
  );
};

describe("AccountSelected", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useAccountContext: vi.fn().mockReturnValue({
        state: {
          selectedAccount: {
            value: {
              address: "0x041fA537c4Fab3d7B91f67B358c126d37CBDa947",
            },
          },
        },
      }),
      useThemeContext: () => ({
        color: "red",
      }),
    }));
  });

  it("should render selectedAccount", async () => {
    renderCoponent();
    const account = screen.getByText(
      cropAccount("0x041fA537c4Fab3d7B91f67B358c126d37CBDa947")
    );
    expect(account).toBeDefined();
  });

  it("should copy account", async () => {
    const copyText = vi.fn();
    // window.navigator.clipboard.writeText = copyText;
    window.navigator = {
      clipboard: {
        writeText: copyText,
      },
    } as any;

    renderCoponent();
    const button = screen.getByTestId("account-button");

    await act(() => {
      fireEvent.click(button);
    });

    expect(copyText).toHaveBeenCalled();
  });
});
