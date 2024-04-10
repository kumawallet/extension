import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { ChainSelector } from "./ChainSelector";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";
import { act } from "react-dom/test-utils";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ChainSelector />
    </I18nextProvider>
  );
};

const setSelectNetwork = vi.fn();

describe("ChainSelector", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useNetworkContext: vi.fn(() => ({
        state: {
          selectedChain: SUBTRATE_CHAINS[0],
          chains: [
            {
              title: "wasm_based",
              chains: SUBTRATE_CHAINS.filter((chain) => !chain.isTestnet),
            },
            {
              title: "evm_based",
              chains: EVM_CHAINS.filter((chain) => !chain.isTestnet),
            },
          ]
        },
        setSelectNetwork: () => setSelectNetwork(),
      }))
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getSetting: vi.fn(() => ({
          value: true
        })),
        updateSetting: vi.fn(),
      }
    }))

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
            }
          }),
        },
      }),
    }))
  });

  it("should render", async () => {
    const { getByTestId, getByAltText } = renderComponent();

    const button = getByTestId("chain-button");

    act(() => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      const chain = getByAltText(SUBTRATE_CHAINS[0].name);
      expect(chain).toBeDefined();
    });
  });

});
