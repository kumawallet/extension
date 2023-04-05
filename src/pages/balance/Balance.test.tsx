import { en } from "@src/i18n";
import i18n from "@src/utils/i18n";
import { render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Balance } from "./Balance";

const renderCoponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Balance />
    </I18nextProvider>
  );
};

describe("Balance", () => {
  beforeEach(() => {
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
              address: "12345clear",
            },
          },
        },
        getSelectedAccount: vi.fn(),
        getAllAccounts: vi.fn(),
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
        },
      }),
      useAssetContext: vi.fn().mockReturnValue({
        state: {
          assets: [
            {
              amount: 0,
            },
          ],
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
      useLocation: () => vi.fn(),
      useNavigate: () => vi.fn(),
    }));
  });

  it("should render", () => {
    renderCoponent();

    waitFor(() => {
      const activeTab = screen.getByText(en.balance.assets);

      expect(activeTab).toBeDefined();
    });
  });
});
