import i18n from "@src/utils/i18n";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { SelectAccountToDerive } from "./SelectAccountToDerive";
import { ACCOUNTS_MOCKS } from "@src/tests/mocks/account-mocks";

const functionMock = {
  onSelect: vi.fn(),
}

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <SelectAccountToDerive
        onSelect={functionMock.onSelect}
      />
    </I18nextProvider>
  );
};


describe("SelectAccountToDerive", () => {
  beforeAll(() => {
    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getAccountstToDerive: () => ACCOUNTS_MOCKS,
      },
    }));
  });

  describe("render", () => {
    it("should select wallet", async () => {
      const { getByTestId } = renderComponent();

      const wallets = getByTestId("wallets-container");

      await waitFor(() => {
        expect(wallets.children.length).toBe(2);
      })

      const firstWallet = wallets.firstChild?.firstChild;

      act(() =>
        fireEvent.click(firstWallet!)
      )

      await waitFor(() =>
        expect(functionMock.onSelect).toHaveBeenCalled()
      )

      await waitFor(() =>
        expect(wallets.innerHTML).contains("border-[#2CEC84]")
      )
    })
  });
});