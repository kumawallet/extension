import { FC } from "react";
import { Chain, CHAINS } from "@src/constants/chains";
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
  selectedMultiSupportChain,
} from "../../tests/mocks/chain-mocks";
import { selectedWASMAccountMock } from "../../tests/mocks/account-mocks";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";

const initialState: InitialState = {
  chains: CHAINS,
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
};

interface TestComponentProps {
  newChain?: Chain;
  type?: string;
}

const TestComponent: FC<TestComponentProps> = ({ newChain, type }) => {
  const { getSelectedNetwork, setNewRpc, setSelectNetwork, state } =
    useNetworkContext();

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
    vi.mock("@src/Extension");
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
      };
      const newState = reducer(initialState, {
        type: "init",
        payload,
      });
      expect(newState).toContain(payload);
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
        expect(newState).toContain(payload);
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
        expect(newState).toContain(payload);
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
        expect(newState).toContain(payload);
      });
    });
    describe("set-api", () => {
      it("with rpc", () => {
        const payload = {
          api: undefined,
          rpc: rpcMock,
        };
        const newState = reducer(initialState, {
          type: "set-api",
          payload,
        });
        expect(newState).toContain(payload);
      });
      it("without rpc", () => {
        const payload = {
          api: ethApiMock,
        };
        const newState = reducer(initialState, {
          type: "set-api",
          payload,
        });
        expect(newState).toContain(payload);
      });
      it("default", () => {
        const newState = reducer(initialState, {
          type: "default" as any,
          payload: {} as any,
        });
        expect(newState).toContain(initialState);
      });
    });
  });
  describe("useEffect", () => {
    it("should init", async () => {
      const Extension: any = await import("@src/Extension");
      Extension.default.getNetwork = vi
        .fn()
        .mockResolvedValue({ chain: selectedWASMChainMock });

      Extension.default.getSelectedAccount = vi
        .fn()
        .mockResolvedValue(selectedWASMAccountMock);

      renderComponent({});
      await waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state).toHaveProperty("type", "WASM");
        expect(state).toHaveProperty("rpc", selectedWASMChainMock.rpc.wasm);
      });
    });
    it("should show error", async () => {
      const Extension: any = await import("@src/Extension");
      Extension.default = {
        getNetwork: vi.fn().mockRejectedValue("no_network"),
      };
      renderComponent({});
      waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state).toEqual(initialState);
      });
    });
  });
  describe("setSelectedNetwork", () => {
    it("should set new evm chain", async () => {
      const Extension: any = await import("@src/Extension");
      Extension.default.getSelectedAccount = vi
        .fn()
        .mockResolvedValue(selectedEVMAccountMock);
      Extension.default.setNetwork = vi.fn().mockResolvedValue(true);
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
      const Extension: any = await import("@src/Extension");
      Extension.default.getSelectedAccount = vi
        .fn()
        .mockResolvedValue(selectedEVMAccountMock);
      Extension.default.setNetwork = vi.fn().mockRejectedValue("no_network");
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
      const Extension: any = await import("@src/Extension");
      Extension.default.getNetwork = vi
        .fn()
        .mockResolvedValue({ chain: selectedWASMChainMock });
      renderComponent();
      act(() => {
        fireEvent.click(screen.getByTestId(testIds.getSelectedBtn));
      });
      waitFor(() =>
        expect(screen.getByTestId(testIds.state).innerHTML).contains(
          selectedWASMChainMock.name
        )
      );
    });
    it("should show error", async () => {
      const Extension: any = await import("@src/Extension");
      Extension.default.getNetwork = vi
        .fn()
        .mockRejectedValue("no_default_network");
      renderComponent();
      act(() => {
        fireEvent.click(screen.getByTestId(testIds.getSelectedBtn));
      });
      waitFor(() =>
        expect(screen.getByTestId(testIds.state).innerHTML).contains(
          selectedWASMChainMock.name
        )
      );
    });
  });
  describe("setNewRpc", () => {
    it("should keep the current rpc", async () => {
      const Extension: any = await import("@src/Extension");
      Extension.default.getNetwork = vi
        .fn()
        .mockResolvedValue({ chain: selectedWASMChainMock });

      Extension.default.getSelectedAccount = vi
        .fn()
        .mockResolvedValue(selectedWASMAccountMock);

      renderComponent();
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
    it("should set new rpc if chain support WASM and EVM", async () => {
      const Extension: any = await import("@src/Extension");
      Extension.default = {
        getSelectedAccount: vi.fn().mockResolvedValue(selectedWASMAccountMock),
        getNetwork: vi
          .fn()
          .mockResolvedValue({ chain: selectedMultiSupportChain }),
      };
      renderComponent({
        type: selectedEVMAccountMock.type,
      });
      await waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state).toHaveProperty("rpc", selectedMultiSupportChain.rpc.wasm);
      });
      act(() => {
        fireEvent.click(screen.getByTestId(testIds.selectedBtn));
        fireEvent.click(screen.getByTestId(testIds.newRpcBtn));
      });
      await waitFor(() =>
        expect(
          JSON.parse(screen.getByTestId(testIds.state).innerHTML)
        ).toHaveProperty("rpc", selectedMultiSupportChain.rpc.evm)
      );
    });
  });
});
