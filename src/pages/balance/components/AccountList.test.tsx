import {
  accountsMocks,
  selectedWASMAccountMock,
} from "@src/tests/mocks/account-mocks";
import i18n from "@src/utils/i18n";
import {

  fireEvent,
  getAllByTestId,
  render,

  waitFor,
} from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { AccountList } from "./AccountList";

const functionsMocks = {
  getAllAccounts: vi.fn(),
  setSelectedAccount: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AccountList />
    </I18nextProvider>
  );
};

describe("AccountList", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useAccountContext: vi.fn(() => ({
        getAllAccounts: () => functionsMocks.getAllAccounts(),
        setSelectedAccount: () => functionsMocks.setSelectedAccount(),
        state: {
          accounts: accountsMocks,
          setSelectedAccount: selectedWASMAccountMock,
        },
      })),
    }));

    vi.mock("./CreateWalletFromInside", () => ({
      CreateWalletFromInside: () => (
        <div data-testid="CreateWalletFromInside" />
      ),
    }));

    vi.mock("./ImportWalletFromInside", () => ({
      ImportWalletFromInside: () => (
        <div data-testid="ImportWalletFromInside" />
      ),
    }));

    vi.mock("./AccountDetails", () => ({
      AccountDetails: () => <div data-testid="AccountDetails" />,
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

  describe("account list", () => {
    it("should open all accounts", async () => {
      const { getByTestId } = renderComponent();

      const accountButton = getByTestId("account-button");

      fireEvent.click(accountButton);

      await waitFor(() => {
        const walletList = getByTestId("wallet-list");
        expect(Array.from(walletList.children).length).toBe(2);
      });
    });

    it("should set new account", async () => {
      const { getByTestId } = renderComponent();

      const accountButton = getByTestId("account-button");

      fireEvent.click(accountButton);

      await waitFor(() => {
        const walletList = getByTestId("wallet-list");
        expect(Array.from(walletList.children).length).toBe(2);
      });

      const walletList = getByTestId("wallet-list");

      fireEvent.click(walletList.children[0].children[0]);

      expect(functionsMocks.setSelectedAccount).toHaveBeenCalled();
    });
  });

  describe("action select", () => {
    it("should call create option", async () => {
      const { getByTestId } = renderComponent();

      const accountButton = getByTestId("account-button");

      fireEvent.click(accountButton);

      await waitFor(() => {
        const walletList = getByTestId("wallet-list");
        expect(Array.from(walletList.children).length).toBe(2);
      });

      const createButton = getByTestId("create-button");

      fireEvent.click(createButton);

      await waitFor(() => {
        expect(getByTestId("CreateWalletFromInside")).toBeDefined();
      });
    });

    it("should call import option", async () => {
      const { getByTestId } = renderComponent();

      const accountButton = getByTestId("account-button");

      fireEvent.click(accountButton);

      await waitFor(() => {
        const walletList = getByTestId("wallet-list");
        expect(Array.from(walletList.children).length).toBe(2);
      });

      const createButton = getByTestId("import-button");

      fireEvent.click(createButton);

      await waitFor(() => {
        expect(getByTestId("ImportWalletFromInside")).toBeDefined();
      });
    });

    it("should call details option", async () => {
      const { getByTestId } = renderComponent();

      const accountButton = getByTestId("account-button");

      fireEvent.click(accountButton);

      await waitFor(() => {
        const walletList = getByTestId("wallet-list");
        expect(Array.from(walletList.children).length).toBe(2);
      });

      const walletList = getByTestId("wallet-list");
      const button = walletList.children[0] as HTMLElement;

      const detailsButton = getAllByTestId(button, "details");


      fireEvent.click(detailsButton[0]);

      await waitFor(() => {
        expect(getByTestId("AccountDetails")).toBeDefined();
      });
    });
  });
});
