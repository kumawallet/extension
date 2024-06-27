import i18n from "@src/utils/i18n";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { AssetToSend } from "./AssetToSend";
import { EVM_CHAINS, SUBSTRATE_CHAINS } from "@src/constants/chainsData";
import { BN } from "@polkadot/util";
import { SendTxForm } from "../Send";
import { ChainStatus } from "@src/storage/entities/Provider";

type MOCK_WATCH_TYPE = keyof Partial<SendTxForm>;

const WATCH_XCM_MOCK: Partial<SendTxForm> = {
  originNetwork: {
    id: "polkadot",
    symbol: "DOT",
    decimals: 10,
  } as SendTxForm["originNetwork"],
  targetNetwork: {
    id: "astar",
    symbol: "ASTR",
    decimals: 18,
  } as SendTxForm["targetNetwork"],
  asset: {
    symbol: "DOT",
    decimals: 10,
    balance: "1",
  } as SendTxForm["asset"],
  isXcm: true,
  senderAddress: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
};

const WATCH_MOCK: Partial<SendTxForm> = {
  originNetwork: {
    id: "polkadot",
    symbol: "DOT",
    decimals: 10,
  } as SendTxForm["originNetwork"],
  targetNetwork: {
    id: "polkadot",
    symbol: "DOT",
    decimals: 10,
  } as SendTxForm["targetNetwork"],
  asset: {
    symbol: "DOT",
    decimals: 10,
    balance: "1",
  } as SendTxForm["asset"],
  isXcm: false,
  senderAddress: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
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

const useFormContextMock = vi.hoisted(() => ({
  watch: vi.fn((key: MOCK_WATCH_TYPE) => WATCH_XCM_MOCK[key]),
}));

describe("AssetToSend", () => {
  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: vi.fn(() => ({
        register: vi.fn(),
        watch: useFormContextMock.watch,
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
              chains: SUBSTRATE_CHAINS.filter((chain) => !chain.isTestnet),
            },
            {
              title: "evm_based",
              chains: EVM_CHAINS.filter((chain) => !chain.isTestnet),
            },
          ],
          selectedChain: {
            polkadot: {
              type: "wasm",
            },
          },
          chainStatus: {
            polkadot: ChainStatus.CONNECTED,
            ethereum: ChainStatus.CONNECTED,
          }
        },
      }),
      useAssetContext: () => ({
        state: {
          assets: {
            [WATCH_XCM_MOCK.senderAddress as string]: {
              "polkadot": {
                assets: [
                  {
                    id: "-1",
                    symbol: "DOT",
                    decimals: 10,
                    balance: new BN("1"),
                    address: "",
                  },
                ]
              }
            }
          },
        },
      }),
      useAccountContext: () => ({
        state: {
          accounts: [
            {
              type: "wasm",
              value: {
                address: WATCH_MOCK.senderAddress,
              },
            },
          ],
        },
      }),
    }));
  });

  describe("render", () => {
    it("should render with xcm assets", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });

    it("should render with non-xcm assets", () => {
      useFormContextMock.watch = vi.fn(
        (key: MOCK_WATCH_TYPE) => WATCH_MOCK[key]
      );

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
      });

      await waitFor(() => {
        expect(functionMocks.setValue).toHaveBeenCalled();
      });
    });
  });

  describe("select asset to send", () => {
    it("should select new asset", async () => {
      const { getByTestId } = renderComponent();

      const assetToSendContainer = getByTestId("asset-to-send");

      const assetToSendButton = assetToSendContainer.children[1]?.children[0];

      act(() => {
        fireEvent.click(assetToSendButton);
      });

      await waitFor(() => {
        expect(getByTestId("filtered-items-container")).toBeDefined();
      });

      const filteredItems = getByTestId("filtered-items-container");

      expect(filteredItems.children.length).toBeGreaterThan(0);
    });
  });
});
