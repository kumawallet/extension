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
import { selectedWASMChainMock } from "../../tests/mocks/chain-mocks";
import { selectedWASMAccountMock } from "../../tests/mocks/account-mocks";

vi.mock("@src/Extension");
vi.mock("ethers", () => ({
  ethers: {
    providers: {
      JsonRpcProvider: vi.fn(),
    },
  },
}));
vi.mock("@polkadot/api", () => ({
  ApiPromise: {
    create: vi.fn().mockResolvedValue({}),
  },
  WsProvider: vi.fn(),
}));

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
  rpc?: string;
}

const TestComponent: FC<TestComponentProps> = ({ newChain, rpc }) => {
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
        onClick={() => setNewRpc(rpc as string)}
      />
      <p data-testid={testIds.state}>{JSON.stringify(state)}</p>
    </>
  );
};

const renderComponent = (props?: TestComponentProps) => {
  return render(
    <NetworkProvider>
      <TestComponent {...props} />
    </NetworkProvider>
  );
};

describe("NetworkProvider", () => {
  beforeAll(async () => {
    const Extension: any = await import("@src/Extension");
    Extension.default = {
      getNetwork: vi.fn().mockResolvedValue({ chain: selectedWASMChainMock }),
      getSelectedAccount: vi.fn().mockResolvedValue(selectedWASMAccountMock),
      setNetwork: vi.fn().mockResolvedValue({}),
    };
  });

  afterAll(() => {
    vi.clearAllMocks();
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
    });
  });

  describe("useEffect", () => {
    it("should init", async () => {
      renderComponent({});

      waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state).toHaveProperty("type", "WASM");
        expect(state).toHaveProperty("rpc", selectedWASMChainMock.rpc.wasm);
      });
    });
  });

  describe("setSelectedNetwork", () => {
    it("should set new evm chain", async () => {
      const Extension: any = await import("@src/Extension");
      (Extension.default.getSelectedAccount = vi
        .fn()
        .mockResolvedValue(selectedEVMAccountMock)),
        renderComponent({ newChain: selectedEVMChainMock });

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.selectedBtn));
      });

      waitFor(() => {
        const state = JSON.parse(screen.getByTestId(testIds.state).innerHTML);
        expect(state).toHaveProperty("rpc", selectedEVMChainMock.rpc.evm);
      });
    });
  });

  describe("getSelectedNetwork", () => {
    it("should getSelectedNetwork", () => {
      renderComponent();

      const Extension: any = import("@src/Extension");
      (Extension.getSelectedAccount = vi
        .fn()
        .mockResolvedValue(selectedWASMChainMock)),
        act(() => {
          fireEvent.click(screen.getByTestId(testIds.selectedBtn));
        });

      waitFor(() =>
        expect(screen.getByTestId(testIds.state).innerHTML).contains(
          selectedWASMChainMock.name
        )
      );
    });
  });

  describe("setNewRpc", () => {
    it("should set new rpc", async () => {
      renderComponent();
      act(() => {
        fireEvent.click(screen.getByTestId(testIds.selectedBtn));
      });
      act(() => {
        fireEvent.click(screen.getByTestId(testIds.newRpcBtn));
      });
      waitFor(() =>
        expect(
          JSON.parse(screen.getByTestId(testIds.state).innerHTML)
        ).toHaveProperty("rpc", selectedWASMChainMock.rpc.wasm)
      );
    });
  });
});
