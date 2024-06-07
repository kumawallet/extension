import { I18nextProvider } from "react-i18next";
import { NetworkProvider, useNetworkContext } from "./NetworkProvider";
import i18n from "@src/utils/i18n";
import { render, waitFor } from "@testing-library/react";
import { SUBTRATE_CHAINS } from "@src/constants/chainsData";
import { ChainType, SelectedChain } from "@src/types";
import { ChainStatus, NetworkStatus } from "@src/storage/entities/Provider";

const TestComponent = () => {
  const { refreshNetworks, state: {
    chains,
    selectedChain
  } } = useNetworkContext();


  return (
    <div>
      <button data-testid="refrest-network" onClick={refreshNetworks}>
        Refresh Networks
      </button>
      <div data-testid="chains">{JSON.stringify(chains)}</div>
      <div data-testid="selected-chain">{JSON.stringify(selectedChain)}</div>
    </div>
  );
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <NetworkProvider>
        <TestComponent />
      </NetworkProvider>
    </I18nextProvider>
  );
};


describe("NetworkProvider", () => {
  beforeAll(() => {
    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getSetting: () => ({
          value: true
        }),
        getCustomChains: () => ([]),
        networkSubscribe: (cb: (network: SelectedChain) => void) => cb({
          polkadot: {
            type: ChainType.WASM
          }
        }),
        netwotkStatusSubscribe: (cb: (networkStatus: NetworkStatus) => void) => cb({
          polkadot: ChainStatus.CONNECTED,
        }),
      }
    }))
  })

  it("should render", async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("chains").innerHTML).toContain(JSON.stringify(SUBTRATE_CHAINS[0]));
    })
    expect(getByTestId("selected-chain").textContent).toBe(JSON.stringify({
      polkadot: {
        type: ChainType.WASM
      }
    }));
  });


  it("should refresh networks", async () => {
    const { getByTestId } = renderComponent();
    const refreshNetworkButton = getByTestId("refrest-network");
    refreshNetworkButton.click();

    await waitFor(() => {
      expect(getByTestId("chains").innerHTML).toContain(JSON.stringify(SUBTRATE_CHAINS[0]));
    });
  });
});