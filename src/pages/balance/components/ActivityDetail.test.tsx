import i18n from "@src/utils/i18n";
import { render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { ActivityDetail } from "./ActivityDetail";
import { EVM_CHAINS, SUBSTRATE_CHAINS } from "@src/constants/chainsData";

const functionMocks = {
  navigate: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ActivityDetail />
    </I18nextProvider>
  );
};

describe("ActivityDetail", () => {
  beforeAll(() => {
    vi.mock("@src/hooks", async () => {
      const actual = vi.importActual("@src/hooks");

      return {
        ...actual,
        useToast: () => ({
          showErrorToast: vi.fn(),
        }),
      };
    });

    vi.mock("react-router-dom", () => ({
      useNavigate: () => functionMocks.navigate,
      useLocation: () => ({
        state: {
          id: "1",
          amount: "1",
          asset: "DOT",
          blockNumber: 1,
          fee: "100000000",
          hash: "0x1234567890",
          originNetwork: "BNB",
          targetNetwork: "BNB",
          recipient: "0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627",
          sender: "0x55423C073C5e5Ce2D30Ec466a6cDEF0803EC32Cc",
          status: "success",
          tip: "100000000",
          timestamp: 1,
          type: "transfer",
          isSwap: false,
        },
      }),
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getRegistryAddresses: () => ({
          contacts: [
            {
              name: "John Doe",
              address: "0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627",
            },
          ],
          ownAccounts: [],
        }),
      },
    }));

    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: {
          chains: [
            {
              title: "wasm_based",
              chains: SUBSTRATE_CHAINS.filter((chain) => !chain.isTestnet),
            },
            {
              title: "evm_based",
              chains: EVM_CHAINS.filter((chain) => !chain.isTestnet),
            },
          ],
          selectedChain: SUBSTRATE_CHAINS[0],
        },
      }),
      useAccountContext: () => ({
        state: {
          selectedAccount: {
            key: "key",
          },
        },
      }),
    }));
  });

  describe("render", () => {
    it("should render", async () => {
      const { container } = renderComponent();

      await waitFor(() => {
        expect(container).toBeDefined();
      });
    });
  });

  describe("explorer button", () => {
    it("should call explorer button", async () => {
      vi.spyOn(window, "open").mockImplementation(() => null);

      const { getByTestId } = renderComponent();

      const explorerButton = getByTestId("explorer-button");

      explorerButton.click();

      await waitFor(() => {
        expect(window.open).toHaveBeenCalled();
      });
    });
  });
});
