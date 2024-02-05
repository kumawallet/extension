import { selectedEVMAccountMock } from "@src/tests/mocks/account-mocks";
import { fireEvent, render } from "@testing-library/react";
import { Receive } from "./Receive";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";

const copyToClipboard = vi.fn();

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
      useNavigate: () => vi.fn(),
    }));

    vi.mock("@src/providers", () => ({
      useAccountContext: () => ({
        state: {
          selectedAccount: selectedEVMAccountMock,
        },
      }),
      useThemeContext: () => ({
        color: "red",
      }),
    }));

    vi.mock("@src/utils/env", () => ({
      version: "1.0.0",
      getWebAPI: () => ({
        tabs: {
          getCurrent: () => Promise.resolve(undefined),
          create: () => vi.fn(),
        },
        runtime: {
          getURL: vi.fn(),
          connect: vi.fn().mockReturnValue({
            onMessage: {
              addListener: vi.fn(),
            },
          }),
        },
      }),
    }))

    // mock useCopyToClipboard
    vi.mock("@src/hooks", () => ({
      useCopyToClipboard: () => ({
        Icon: () => null,
        copyToClipboard: () => copyToClipboard(),
      }),
    }));
  });

  it("should render", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("account-button")).toBeDefined();
  });

  it("should copy to clipboard", () => {
    const { getByTestId } = renderComponent();
    const accountButton = getByTestId("account-button");

    fireEvent.click(accountButton);

    expect(copyToClipboard).toHaveBeenCalled();
  });
});
