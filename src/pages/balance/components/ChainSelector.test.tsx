import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { ChainSelector } from "./ChainSelector";
import { EVM_CHAINS, SUBSTRATE_CHAINS } from "@src/constants/chainsData";
import { ChainStatus } from "@src/storage/entities/Provider";

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
          selectedChain: SUBSTRATE_CHAINS[0],
          chainStatus: {
            polkadot: ChainStatus.CONNECTED
          },
          chains: [
            {
              title: "wasm_based",
              chains: SUBSTRATE_CHAINS.filter((chain) => !chain.isTestnet),
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

  });

  it("should render", async () => {
    const { getByTestId, getByAltText } = renderComponent();

    const button = getByTestId("chain-button");

    fireEvent.click(button);

    await waitFor(() => {
      const chain = getByAltText(SUBSTRATE_CHAINS[0].name);
      expect(chain).toBeDefined();
    });
  });

  it("should filter chains", async () => {

    const { getByTestId, getByAltText } = renderComponent();

    const button = getByTestId("chain-button");

    fireEvent.click(button);


    await waitFor(() => {

      const input = getByTestId("search-input");

      fireEvent.change(input, { target: { value: "polkadot" } });
    })


    const chain = getByAltText(SUBSTRATE_CHAINS[0].name);

    expect(chain).toBeDefined();

  })


});
