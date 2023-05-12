import { CHAINS } from "@src/constants/chains";
import { accountsMocks } from "@src/tests/mocks/account-mocks";
import i18n from "@src/utils/i18n";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { ChainSelector } from "./ChainSelector";

const renderCoponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ChainSelector />
    </I18nextProvider>
  );
};

const setSelectNetwork = vi.fn();

describe("ChainSelector", () => {
  beforeAll(() => {
    vi.mock("@src/Extension", () => ({
      default: {
        getAllAccounts: vi.fn().mockReturnValue(accountsMocks),
        getSetting: vi.fn().mockReturnValue({
          value: true,
        }),
      },
    }));
    vi.mock("@src/providers", () => ({
      useAccountContext: vi.fn().mockReturnValue({
        state: {
          selectedAccount: {
            value: {
              address: "12345clear",
            },
          },
        },
        getSelectedAccount: vi.fn(),
        getAllAccounts: vi.fn().mockReturnValue(accountsMocks),
        setSelectedAccount: vi.fn(),
      }),
      useNetworkContext: vi.fn().mockReturnValue({
        state: {
          rpc: "ws://1234",
          selectedChain: {
            name: "Polakdot",
          },
          type: "wasm",
          api: {
            query: {},
          },
          chains: {
            [CHAINS[0].name]: CHAINS[0].chains,
            [CHAINS[1].name]: CHAINS[1].chains,
            custom: [],
          },
        },
        setSelectNetwork: () => setSelectNetwork(),
      }),
    }));
    vi.mock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));
  });

  it("should render", async () => {
    const { getByTestId, getByText } = renderCoponent();

    const button = getByTestId("chain-button");

    act(() => {
      fireEvent.click(button);
    });
    await waitFor(() => {
      const account = getByText(CHAINS[0].chains[0].name);
      expect(account).toBeDefined();
    });
  });

  it("should change account", async () => {
    const { getByText, getByTestId } = renderCoponent();

    const button = getByTestId("chain-button");

    act(() => {
      fireEvent.click(button);
    });
    await waitFor(() => {
      expect(getByText(CHAINS[0].chains[0].name)).toBeDefined();
    });
    const account = getByText(CHAINS[0].chains[0].name);

    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    act(() => {
      fireEvent.click(account.parentElement as HTMLElement);
    });
    await waitFor(() => {
      expect(setSelectNetwork).toHaveBeenCalled();
    });
  });
});
