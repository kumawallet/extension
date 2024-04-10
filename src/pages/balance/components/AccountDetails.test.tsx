import i18n from "@src/utils/i18n";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { AccountDetails } from "./AccountDetails";
import Account from "@src/storage/entities/Account";
import { SUBQUERY_CHAINS } from "@src/services/historic-transactions/subquery/subquery-chains";

const dataMocks = {
  accountData: {
    value: {
      name: "Account 1",
      address: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
      keyring: "wasm-5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
    },
    key: "wasm",
  },
};

const functionMocks = {
  onBack: vi.fn(),
  onClose: vi.fn(),
  updateAccountName: vi.fn(),
  deleteAccount: vi.fn(),
  resetWallet: vi.fn(),
  validatePassword: vi.fn()
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AccountDetails
        onBack={functionMocks.onBack}
        onClose={functionMocks.onClose}
        title="Title"
        accountData={dataMocks.accountData as Account}
      />
    </I18nextProvider>
  );
};

describe("AccountDetails", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useAccountContext: () => ({
        state: {
          accounts: [{}],
        },
        updateAccountName: functionMocks.updateAccountName,
        deleteAccount: functionMocks.deleteAccount,
      }),
      useNetworkContext: () => ({
        state: {
          selectedChain: SUBQUERY_CHAINS[0],
        },
      }),
    }));

    vi.mock("@src/hooks", async () => {
      const actual = await vi.importActual("@src/hooks");

      return {
        ...actual,
        useToast: () => ({
          showErrorToast: vi.fn(),
        }),
      };
    });

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        resetWallet: () => functionMocks.resetWallet(),
        validatePassword: () => functionMocks.validatePassword(),
      },
    }));

    vi.mock("@src/utils/env", () => ({
      version: "1.0.0",
      getWebAPI: () => ({
        tabs: {
          getCurrent: () => Promise.resolve(undefined),
        },
        runtime: {
          getURL: vi.fn(),
          connect: vi.fn().mockReturnValue({
            onMessage: {
              addListener: vi.fn(),
            },
            onDisconnect: {
              addListener: vi.fn(),
            },
          }),
        },
      }),
    }));
  });

  describe("render", () => {
    it("should render", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });

  describe("change account name", () => {
    it("should call updateAccountName", async () => {
      const { getByTestId } = renderComponent();

      const editButton = getByTestId("edit-button");

      fireEvent.click(editButton);

      await waitFor(() => {
        expect(getByTestId("input-name")).toBeDefined();
      });

      const inputName = getByTestId("input-name");

      act(() => {
        fireEvent.change(inputName, { target: { value: "Account2" } });
        fireEvent.keyDown(inputName, { key: "Enter", code: "Enter" });
      });

      await waitFor(() => {
        expect(functionMocks.updateAccountName).toBeCalled();
      });
    });
  });

  describe("reset wallet", () => {
    it("should reset wallet", async () => {
      const { getByTestId } = renderComponent();

      const resetButton = getByTestId("delete-account");

      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(getByTestId("confirm-delete-button")).toBeDefined();
      });

      const confirmButton = getByTestId("confirm-delete-button");

      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(functionMocks.resetWallet).toBeCalled();
      });
    });
  });

  describe("show seed", () => {
    it("should show seed", async () => {
      const { getByTestId } = renderComponent();

      const showSeedButton = getByTestId("show-key-button");

      fireEvent.click(showSeedButton);

      await waitFor(() => {
        expect(getByTestId("password-input")).toBeDefined();
      });

      const passwordInput = getByTestId("password-input");
      fireEvent.change(passwordInput, { target: { value: "Test.123" } });
      fireEvent.keyDown(passwordInput, { key: "Enter", code: "Enter" });

      const confirmPasswordButton = getByTestId("confirm-password");

      fireEvent.click(confirmPasswordButton);

      await waitFor(() => {
        expect(functionMocks.validatePassword).toBeCalled();
      })

    })
  })
});
