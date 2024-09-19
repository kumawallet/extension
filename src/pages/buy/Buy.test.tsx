import { I18nextProvider } from "react-i18next";
import { Buy } from "./Buy";
import { fireEvent, render, waitFor } from "@testing-library/react";
import i18n from "@src/utils/i18n";
import {
  ACCOUNTS_MOCKS,
  POLKADOT_ACCOUNT_MOCK,
} from "@src/tests/mocks/account-mocks";

const functionMock = {
  navigate: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Buy />
    </I18nextProvider>
  );
};

describe("Buy", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => functionMock.navigate(),
    }));

    vi.mock("@src/providers", () => ({
      useAccountContext: () => ({
        state: {
          selectedAccount: POLKADOT_ACCOUNT_MOCK,
          accounts: ACCOUNTS_MOCKS,
        },
      }),
    }));
  });

  it("should render", () => {
    const { container } = renderComponent();

    expect(container).toBeDefined();
  });

  it("should call handlerTransak", async () => {
    const windowOpen = vi.spyOn(window, "open");

    const { getByTestId } = renderComponent();

    const checkBox = getByTestId("checkbox-text");

    fireEvent.click(checkBox);

    await waitFor(() => {
      expect((getByTestId("checkbox") as HTMLInputElement).checked).toBe(true);
    });

    fireEvent.click(getByTestId("buy-button"));

    await waitFor(() => {
      expect(windowOpen).toHaveBeenCalled();
    });
  });

  it("should select another asset", async () => {
    const { getByTestId } = renderComponent();

    const input = getByTestId("asset-input");

    fireEvent.input(input, {
      target: {
        value: "AST",
      }
    });

    await waitFor(() => {
      expect(getByTestId("asset-options")).toBeDefined();
    });


    fireEvent.click(getByTestId("asset-options")!.firstChild!);

    await waitFor(() => {
      expect((getByTestId("asset-input") as HTMLInputElement).value).toBe("ASTR");
    });
  });
});
