import { accountsMocks } from "@src/tests/mocks/account-mocks";
import i18n from "@src/utils/i18n";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { AccountList } from "./AccountList";

const renderCoponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AccountList />
    </I18nextProvider>
  );
};

describe("AccountList", () => {
  beforeAll(() => {
    vi.mock("ethers", () => ({
      ethers: {
        providers: {
          JsonRpcProvider: vi.fn().mockResolvedValue({ getBalance: () => 0 }),
        },
      },
    }));
    vi.mock("@polkadot/api", () => ({
      ApiPromise: {
        create: vi.fn().mockResolvedValue({ query: () => 0 }),
      },
      WsProvider: vi.fn(),
    }));
    vi.mock("@src/providers", () => ({
      useAccountContext: vi.fn().mockReturnValue({
        state: {
          selectedAccount: {
            value: {
              address: "0x041fA537c4Fab3d7B91f67B358c126d37CBDa947",
            },
          },
          accounts: [
            {
              key: "EVM-0x041fA537c4Fab3d7B91f67B358c126d37CBDa947",
              value: {
                address: "0x041fA537c4Fab3d7B91f67B358c126d37CBDa947",
                keyring: "EVM-0x041fA537c4Fab3d7B91f67B358c126d37CBDa947",
                name: "asd",
              },
              type: "EVM",
            },
          ],
        },
        getSelectedAccount: vi.fn(),
        getAllAccounts: vi.fn(),
      }),
      useNetworkContext: vi.fn().mockReturnValue({
        state: {
          rpc: "ws://1234",
          selectedChain: {
            name: "Ehetereum",
          },
          type: "wasm",
          api: {
            query: {},
          },
        },
      }),
    }));

    vi.mock("@src/hooks", () => ({
      useToast: vi.fn().mockReturnValue({
        showErrorToast: vi.fn(),
      }),
    }));

    vi.mock("@src/utils/assets", async () => ({
      formatAmountWithDecimals: vi.fn().mockReturnValue(0),
      getNatitveAssetBalance: vi.fn().mockReturnValue(10),
      getAssetUSDPrice: vi.fn().mockReturnValue(8.9),
    }));

    vi.mock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));
  });

  it("should render accounts", async () => {
    renderCoponent();

    const button = screen.getByTestId("account-button");

    await act(() => {
      fireEvent.click(button);
    });
    waitFor(() => {
      const account = screen.getByText(accountsMocks[0].value.name);
      expect(account).toBeDefined();
    });
  });
});
