import { FC } from "react";
import { NetworkProvider, reducer, useNetworkContext } from "./NetworkProvider";
import { vi } from "vitest";
import { InitialState } from "./types";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { Chain, ChainsState } from "@src/types";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";

const initialState: InitialState = {
  chains: [],
  selectedChain: null,
  api: null,
  init: false,
};

const testIds = {
  state: "state-response",
  selectedBtn: "select-btn",
  getSelectedBtn: "get-selected-btn",
  newRpcBtn: "new-rpc-btn",
  refreshNetworksBtn: "refresh-networks-btn",
};

const CHAINS_MOCK: ChainsState = [
  {
    title: "wasm_based",
    chains: SUBTRATE_CHAINS.filter((chain) => !chain.isTestnet),
  },
  {
    title: "evm_based",
    chains: EVM_CHAINS.filter((chain) => !chain.isTestnet),
  },
];

const MOCK_WASM_SELECTED_CHAIN = SUBTRATE_CHAINS[0];

const MOCK_EVM_SELECTED_CHAIN = EVM_CHAINS[0];

const CUSTOM_CHAINS_MOCK: Chain[] = [
  {
    id: "custom-1",
    name: "custom-1",
    decimals: 18,
    isTestnet: false,
    logo: "",
    rpcs: [""],
    symbol: "C1",
    type: "wasm",
    explorer: "",
    isCustom: true,
  },
];

interface TestComponentProps {
  newChain?: Chain;
  type?: string;
}

const TestComponent: FC<TestComponentProps> = ({ newChain }) => {
  const { initializeNetwork, setSelectNetwork, refreshNetworks, state } =
    useNetworkContext();

  return (
    <>
      <button
        data-testid={testIds.selectedBtn}
        onClick={() => setSelectNetwork(newChain as Chain)}
      />
      {/* <button
        data-testid={testIds.getSelectedBtn}
        onClick={() => getSelectedNetwork()}
      />
      <button
        data-testid={testIds.newRpcBtn}
        onClick={() => setNewRpc(type as string)}
      /> */}
      <button
        data-testid={testIds.refreshNetworksBtn}
        onClick={() => refreshNetworks()}
      />

      <p data-testid={testIds.state}>{JSON.stringify(state)}</p>
    </>
  );
};

const renderComponent = (props?: TestComponentProps) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <NetworkProvider>
        <TestComponent {...props} />
      </NetworkProvider>
    </I18nextProvider>
  );
};

describe("NetworkProvider", () => {
  beforeAll(async () => {
    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getSetting: vi.fn().mockReturnValue({
          value: true,
        }),
        getCustomChains: vi.fn().mockResolvedValue(() => CUSTOM_CHAINS_MOCK),
        setNetwork: vi.fn().mockResolvedValue(true),
        alreadySignedUp: vi.fn().mockResolvedValue(true),
        getNetwork: vi.fn().mockResolvedValue(() => MOCK_WASM_SELECTED_CHAIN),
      },
    }));
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
  });

  describe("reducer", () => {
    describe("init", () => {
      it("init", () => {
        const newState = reducer(initialState, {
          type: "init",
          payload: {
            selectedChain: MOCK_WASM_SELECTED_CHAIN,
            chains: CHAINS_MOCK,
          },
        });
        expect(newState.selectedChain).toMatchObject(MOCK_WASM_SELECTED_CHAIN);
        expect(newState.chains).toMatchObject(CHAINS_MOCK);
      });
    });

    describe("select-network", () => {
      it("should return different state", () => {
        const newState = reducer(initialState, {
          type: "select-network",
          payload: {
            selectedChain: MOCK_WASM_SELECTED_CHAIN,
            api: {},
          },
        });

        expect(newState.selectedChain).toMatchObject(MOCK_WASM_SELECTED_CHAIN);
      });

      it("should return same state", () => {
        const newState = reducer(
          {
            ...initialState,
            selectedChain: MOCK_WASM_SELECTED_CHAIN,
          },
          {
            type: "select-network",
            payload: {
              selectedChain: MOCK_WASM_SELECTED_CHAIN,
              api: {},
            },
          }
        );

        expect(newState.selectedChain).toMatchObject(MOCK_WASM_SELECTED_CHAIN);
        expect(newState.api).toEqual(null);
      });
    });

    describe("set-api", () => {
      it("should set new api", () => {
        const newState = reducer(initialState, {
          type: "set-api",
          payload: {
            api: {},
          },
        });

        expect(newState.api).toEqual({});
      });
    });

    describe("refresh-networks", () => {
      it("should refresh networks", () => {
        const newState = reducer(initialState, {
          type: "refresh-networks",
          payload: {
            chains: CHAINS_MOCK,
          },
        });

        expect(newState.chains).toEqual(CHAINS_MOCK);
      });
    });
  });

  describe("initializeNetwork", () => {
    it("should initialize network", async () => {
      renderComponent({});

      await waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state).toHaveProperty("selectedChain", MOCK_WASM_SELECTED_CHAIN);
      });
    });
  });

  describe("setSelectNetwork", () => {
    it("should set new chain", async () => {
      renderComponent({ newChain: MOCK_EVM_SELECTED_CHAIN });

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.selectedBtn));
      });

      await waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state).toHaveProperty("selectedChain", MOCK_EVM_SELECTED_CHAIN);
      });
    });
  });

  describe("refreshNetworks", () => {
    it("should refresh networks", async () => {
      renderComponent({});

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.refreshNetworksBtn));
      });

      await waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);

        expect(state).toHaveProperty("chains", [
          ...CHAINS_MOCK,
          {
            title: "wasm_based_testnets",
            chains: SUBTRATE_CHAINS.filter((chain) => chain.isTestnet),
          },
          {
            title: "EVM testnets",
            chains: EVM_CHAINS.filter((chain) => chain.isTestnet),
          },
        ]);
      });
    });
  });
});
