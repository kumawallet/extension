import i18n from "@src/utils/i18n";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { AssetToSend } from "./AssetToSend";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";
import { BN } from "@polkadot/util";
import { SendTxForm } from "../Send";

const WATCH_MOCK: Partial<SendTxForm> = {
  originNetwork: {
    id: "polkadot",
    symbol: "DOT",
    decimals: 10,
  } as SendTxForm["originNetwork"],
  targetNetwork: {
    id: "astar",
    symbol: "ASTR",
    decimals: 18,
    // id: "polkadot",
    // symbol: "DOT",
    // decimals: 10,
  } as SendTxForm["targetNetwork"],
  asset: {
    symbol: "DOT",
    decimals: 10,
    balance: "1",
  } as SendTxForm["asset"],
  isXcm: false,
};

const functionMocks = {
  setValue: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AssetToSend />
    </I18nextProvider>
  );
};

describe("AssetToSend", () => {
  beforeAll(() => {
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
            },
          }),
        },
      }),
    }));

    vi.mock("react-hook-form", () => ({
      useFormContext: vi.fn(() => ({
        register: vi.fn(),
        watch: vi.fn((key: string) => WATCH_MOCK[key]),
        setValue: functionMocks.setValue,
        getValues: vi.fn(),
      })),
    }));

    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: {
          chains: [
            {
              title: "wasm_based",
              chains: SUBTRATE_CHAINS.filter((chain) => !chain.isTestnet),
            },
            {
              title: "evm_based",
              chains: EVM_CHAINS.filter((chain) => !chain.isTestnet),
            },
          ],
        },
      }),
      useAssetContext: () => ({
        state: {
          assets: [
            {
              id: "-1",
              symbol: "DOT",
              decimals: 10,
              balance: new BN("1"),
              address: "",
            },
          ],
        },
      }),
    }));
  });

  describe("render", () => {
    it("should render AssetToSend", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });

  describe("input number", () => {
    it("should set new value", async () => {
      const { getByTestId } = renderComponent();

      const input = getByTestId("amount-input");

      expect(input).toBeDefined();

      act(() => {
        fireEvent.change(input, { target: { value: "10" } });
      })

      await waitFor(() => {
        expect(functionMocks.setValue).toHaveBeenCalled();
      });
    });
  });
});
