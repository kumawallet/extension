import { FC } from "react";
import { ethApiMock, selectedEVMChainMock } from "@src/tests/mocks/chain-mocks";
import { NetworkProvider, reducer, useNetworkContext } from "./NetworkProvider";
import { vi } from "vitest";
import { InitialState } from "./types";
import { rpcMock } from "@src/tests/mocks/chain-mocks";
import { selectedEVMAccountMock } from "@src/tests/mocks/account-mocks";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  selectedWASMChainMock,
} from "../../tests/mocks/chain-mocks";
import { selectedWASMAccountMock } from "../../tests/mocks/account-mocks";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import Chains, { Chain } from "@src/storage/entities/Chains";
import { CHAINS, MAINNETS, TESTNETS } from "@src/constants/chains";

const initialState: InitialState = {
  chains: Chains.getInstance(),
  selectedChain: null,
  api: null,
  rpc: "",
  init: false,
  type: "",
};

const testIds = {
  state: "state-response",
  selectedBtn: "select-btn",
  getSelectedBtn: "get-selected-btn",
  newRpcBtn: "new-rpc-btn",
  refreshNetworksBtn: "refresh-networks-btn",
};

const chainsMock = CHAINS.map((c) => ({
  [c.name]: c.chains,
}));

interface TestComponentProps {
  newChain?: Chain;
  type?: string;
}

const TestComponent: FC<TestComponentProps> = ({ newChain, type }) => {
  const {
    getSelectedNetwork,
    setNewRpc,
    setSelectNetwork,
    refreshNetworks,
    state,
  } = useNetworkContext();

  return (
    <>
      <button
        data-testid={testIds.selectedBtn}
        onClick={() => setSelectNetwork(newChain as Chain)}
      />
      <button
        data-testid={testIds.getSelectedBtn}
        onClick={() => getSelectedNetwork()}
      />
      <button
        data-testid={testIds.newRpcBtn}
        onClick={() => setNewRpc(type as string)}
      />
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
    vi.mock("@src/storage/entities/Chains", () => ({
      default: {
        getInstance: vi.fn().mockReturnValue({
          mainnets: [],
          testnets: [],
          custom: [],
        }),
      },
    }));
    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getAllChains: vi.fn().mockReturnValue(() => chainsMock),
      },
    }))


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
    it("init", () => {
      const payload = {
        selectedChain: selectedWASMChainMock,
        rpc: rpcMock,
        type: "WASM",
        chains: chainsMock as unknown as Chains,
      };
      const newState = reducer(initialState, {
        type: "init",
        payload,
      });
      expect(newState).toEqual({
        ...payload,
        init: true,
        api: null,
      });
    });
    describe("select-network", () => {
      it("with rpc and type", () => {
        const payload = {
          selectedChain: selectedWASMChainMock,
          rpc: rpcMock,
          type: "WASM",
        };
        const newState = reducer(initialState, {
          type: "select-network",
          payload,
        });

        expect(newState.selectedChain).toEqual(payload.selectedChain);
        expect(newState.rpc).toEqual(payload.rpc);
        expect(newState.type).toEqual(payload.type);
      });
      it("without rpc", () => {
        const payload = {
          selectedChain: selectedWASMChainMock,
          type: "WASM",
        };
        const newState = reducer(initialState, {
          type: "select-network",
          payload,
        });
        expect(newState.selectedChain).toEqual(payload.selectedChain);
        expect(newState.rpc).toEqual("");
        expect(newState.type).toEqual(payload.type);
      });
      it("without type", () => {
        const payload = {
          selectedChain: selectedWASMChainMock,
          rpc: rpcMock,
        };
        const newState = reducer(initialState, {
          type: "select-network",
          payload,
        });
        expect(newState.selectedChain).toEqual(payload.selectedChain);
        expect(newState.rpc).toEqual(payload.rpc);
      });
    });
    describe("set-api", () => {
      it("with rpc", () => {
        const payload = {
          api: null,
          rpc: rpcMock,
        };
        const newState = reducer(initialState, {
          type: "set-api",
          payload,
        });
        expect(newState.rpc).toEqual('');
      });
      it("without rpc", () => {
        const payload = {
          rpc: '',
          api: ethApiMock,
        };
        const newState = reducer(initialState, {
          type: "set-api",
          payload,
        });
        expect(newState.api).toEqual(payload.api);
      });
      it("default", () => {
        const newState = reducer(initialState, {
          type: "default" as any,
          payload: {} as any,
        });
        expect(newState).toEqual(initialState);
      });
    });

    describe("refresh-networks", () => {
      it("should refresh networks", () => {
        const payload = {
          chains: chainsMock as unknown as Chains,
        };
        const newState = reducer(initialState, {
          type: "refresh-networks",
          payload,
        });
        expect(newState.chains).toEqual(payload.chains);
      });
    });
  });
  describe("useEffect", () => {
    it("should init", async () => {
      const Default = await import("@src/messageAPI/api");
      Default.messageAPI.getNetwork = vi.fn().mockReturnValue({
        chain: selectedWASMChainMock,
      });
      Default.messageAPI.getSelectedAccount = vi.fn().mockReturnValue(
        selectedWASMAccountMock
      );

      renderComponent({});
      await waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state).toHaveProperty("type", "WASM");
        expect(state).toHaveProperty("rpc", selectedWASMChainMock.rpc.wasm);
      });
    });
    it("should show error", async () => {
      const Default = await import("@src/messageAPI/api");
      Default.messageAPI.getNetwork = vi.fn().mockRejectedValue("no_network");
      renderComponent({});

      waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state).toEqual(initialState);
      });
    });
  });
  describe("setSelectedNetwork", () => {
    it("should set new evm chain", async () => {
      const Default = await import("@src/messageAPI/api");
      Default.messageAPI.getSelectedAccount = vi
        .fn()
        .mockResolvedValue(selectedEVMAccountMock);
      Default.messageAPI.setNetwork = vi.fn().mockResolvedValue(true);

      renderComponent({ newChain: selectedEVMChainMock });
      act(() => {
        fireEvent.click(screen.getByTestId(testIds.selectedBtn));
      });
      await waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state).toHaveProperty("rpc", selectedEVMChainMock.rpc.evm);
      });
    });
    it("should show error", async () => {
      const Default = await import("@src/messageAPI/api");
      Default.messageAPI.getSelectedAccount = vi
        .fn()
        .mockResolvedValue(selectedEVMAccountMock);
      Default.messageAPI.setNetwork = vi.fn().mockRejectedValue("no_network");
      renderComponent({ newChain: selectedEVMChainMock });
      act(() => {
        fireEvent.click(screen.getByTestId(testIds.selectedBtn));
      });
      await waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state).toHaveProperty("rpc", "");
      });
    });
  });
  describe("getSelectedNetwork", () => {
    it("should getSelectedNetwork", async () => {
      const Default = await import("@src/messageAPI/api");
      Default.messageAPI.getNetwork = vi
        .fn()
        .mockResolvedValue({ chain: selectedWASMChainMock });

      renderComponent({ newChain: selectedWASMChainMock });
      act(() => {
        fireEvent.click(screen.getByTestId(testIds.getSelectedBtn));
      });
      await waitFor(() =>
        expect(screen.getByTestId(testIds.state).innerHTML).contains(
          selectedWASMChainMock.name
        )
      );
    });
    it("should show error", async () => {
      const Default = await import("@src/messageAPI/api");
      Default.messageAPI.getNetwork = vi.fn().mockRejectedValue("no_default_network");
      renderComponent({ newChain: selectedWASMChainMock });
      act(() => {
        fireEvent.click(screen.getByTestId(testIds.getSelectedBtn));
      });
      await waitFor(() =>
        expect(screen.getByTestId(testIds.state).innerHTML).contains(null)
      );
    });
  });
  describe("setNewRpc", () => {
    it("should keep the current rpc", async () => {
      const Default = await import("@src/messageAPI/api");
      Default.messageAPI.getSelectedAccount = vi
        .fn()
        .mockResolvedValue(selectedWASMAccountMock);
      Default.messageAPI.getNetwork = vi
        .fn()
        .mockResolvedValue({ chain: selectedWASMChainMock });
      Default.messageAPI.getAllChains = vi.fn().mockResolvedValue(chainsMock);
      renderComponent({
        type: selectedWASMAccountMock.type,
      });
      await act(() => {
        fireEvent.click(screen.getByTestId(testIds.selectedBtn));
      });
      await act(() => {
        fireEvent.click(screen.getByTestId(testIds.newRpcBtn));
      });
      await waitFor(() =>
        expect(
          JSON.parse(screen.getByTestId(testIds.state).innerHTML)
        ).toHaveProperty("rpc", selectedWASMChainMock.rpc.wasm)
      );
    });
    // it.skip("should set new rpc if chain support WASM and EVM", async () => {
    //   const Extension = await import("@src/Extension");
    //   Extension.default.getSelectedAccount = vi
    //     .fn()
    //     .mockResolvedValue(selectedWASMAccountMock);
    //   Extension.default.getNetwork = vi
    //     .fn()
    //     .mockResolvedValue({ chain: selectedMultiSupportChain });

    //   Extension.default.getAllChains = vi.fn().mockResolvedValue(chainsMock);

    //   renderComponent({
    //     type: selectedEVMAccountMock.type,
    //   });
    //   await waitFor(() => {
    //     const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
    //     expect(state).toHaveProperty("rpc", selectedMultiSupportChain.rpc.wasm);
    //   });
    //   act(() => {
    //     fireEvent.click(screen.getByTestId(testIds.selectedBtn));
    //     fireEvent.click(screen.getByTestId(testIds.newRpcBtn));
    //   });
    //   await waitFor(() =>
    //     expect(
    //       JSON.parse(screen.getByTestId(testIds.state).innerHTML)
    //     ).toHaveProperty("rpc", selectedMultiSupportChain.rpc.evm)
    //   );
    // });
  });

  describe("refreshNetworks", () => {
    it("should refresh networks", async () => {
      const Default = await import("@src/messageAPI/api");
      Default.messageAPI.getAllChains = vi.fn().mockResolvedValue({
        mainnets: MAINNETS,
        testnets: TESTNETS,
        custom: [],
      });

      renderComponent();
      await waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state.chains).toEqual({
          mainnets: MAINNETS,
          testnets: TESTNETS,
          custom: [],
        });
      });
    });
    it("should show error", async () => {
      const Default = await import("@src/messageAPI/api");
      Default.messageAPI.getAllChains = vi.fn().mockRejectedValue("no_network");
      renderComponent();
      await waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state.selectedChain).toEqual(null);
      });
    });
  });
});
