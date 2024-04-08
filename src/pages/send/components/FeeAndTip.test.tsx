import { render, waitFor } from "@testing-library/react";
import { SendTxForm } from "../Send";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { FeeAndTip } from "./FeeAndTip";
import { BigNumber } from "ethers";

type MOCK_WATCH_TYPE = keyof Partial<SendTxForm>;

const FEE_MOCK = "1000000000000";

const FORM_WASM_XCM_MOCK: Partial<SendTxForm> = {
  originNetwork: {
    type: "wasm",
    symbol: "DOT",
    id: "polkadot",
  } as SendTxForm["originNetwork"],
  targetNetwork: {
    type: "wasm",
    symbol: "ASTR",
    id: "astar",
  } as SendTxForm["targetNetwork"],
  recipientAddress: "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
  senderAddress: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
  amount: "1",
  fee: "0.0001",
  tip: "0.1",
  isTipEnabled: true,
  asset: {
    symbol: "DOT",
  } as SendTxForm["asset"],
};

const FORM_WASM_NATIVE_MOCK: Partial<SendTxForm> = {
  originNetwork: {
    type: "wasm",
    symbol: "DOT",
    id: "polkadot",
  } as SendTxForm["originNetwork"],
  targetNetwork: {
    type: "wasm",
    symbol: "DOT",
    id: "polkadot",
  } as SendTxForm["targetNetwork"],
  recipientAddress: "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
  senderAddress: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
  amount: "1",
  fee: "0.0001",
  tip: "0.1",
  isTipEnabled: true,
  asset: {
    symbol: "DOT",
  } as SendTxForm["asset"],
};

const FORM_WASM_ASSET_TRANSFER_MOCK: Partial<SendTxForm> = {
  originNetwork: {
    type: "wasm",
    symbol: "ASTR",
    id: "astar",
  } as SendTxForm["originNetwork"],
  targetNetwork: {
    type: "wasm",
    symbol: "ASTR",
    id: "astar",
  } as SendTxForm["targetNetwork"],
  recipientAddress: "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
  senderAddress: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
  amount: "1",
  fee: "0.0001",
  tip: "0.1",
  isTipEnabled: true,
  asset: {
    id: "1",
    symbol: "USDT",
  } as SendTxForm["asset"],
};

const FORM_EVM_XCM_MOCK: Partial<SendTxForm> = {
  originNetwork: {
    type: "evm",
    symbol: "GLMR",
    id: "moonbeam-evm",
  } as SendTxForm["originNetwork"],
  targetNetwork: {
    type: "evm",
    symbol: "ASTR",
    id: "astar",
  } as SendTxForm["targetNetwork"],
  recipientAddress: "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
  senderAddress: "0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627",
  amount: "1",
  fee: "0.0001",
  tip: "0",
  isTipEnabled: false,
  asset: {
    symbol: "GLMR",
  } as SendTxForm["asset"],
};

const FORM_EVM_NATIVE_MOCK: Partial<SendTxForm> = {
  originNetwork: {
    type: "evm",
    symbol: "ETH",
    id: "ethereum",
  } as SendTxForm["originNetwork"],
  targetNetwork: {
    type: "evm",
    symbol: "ETH",
    id: "ethereum",
  } as SendTxForm["targetNetwork"],
  recipientAddress: "0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627",
  senderAddress: "0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627",
  amount: "1",
  fee: "0.0001",
  tip: "0",
  isTipEnabled: false,
  asset: {
    symbol: "ETH",
  } as SendTxForm["asset"],
};

const FORM_EVM_ERC20_TRANSFER_MOCK: Partial<SendTxForm> = {
  originNetwork: {
    type: "evm",
    symbol: "ETH",
    id: "ethereum",
  } as SendTxForm["originNetwork"],
  targetNetwork: {
    type: "evm",
    symbol: "ETH",
    id: "ethereum",
  } as SendTxForm["targetNetwork"],
  recipientAddress: "0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627",
  senderAddress: "0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627",
  amount: "1",
  fee: "0.0001",
  tip: "0",
  isTipEnabled: false,
  asset: {
    address: "0x123",
    symbol: "USDT",
  } as SendTxForm["asset"],
};

const dataMocks = {
  seed: "accuse attend color hire car click myth harsh vocal inch term zoo home engage any",
  privateKey:
    "0x3c82e8c2b74ce190d163ed17e44ea0e3bd0111b356695699626e35f462a79125",
  extrinsic: {
    paymentInfo: () => ({
      partialFee: {
        toString: () => FEE_MOCK,
      },
    }),
    toHex: vi.fn(),
  },
};

const functionMocks = {
  reserveTransferAssets: vi.fn(() => dataMocks.extrinsic),
  transferAllowDeath: vi.fn(() => dataMocks.extrinsic),
  transfer: vi.fn(() => dataMocks.extrinsic),
  watch: vi.fn(),
};

const reactHookFormMocks = vi.hoisted(() => ({
  useFormContext: vi.fn(() => ({
    watch: vi.fn(),
    getValues: vi.fn(),
    setValue: vi.fn(),
  })),
}));

const messageAPIMock = vi.hoisted(() => ({
  messageAPI: {
    showKey: vi.fn(),
  },
}));

const providersMocks = vi.hoisted(() => ({
  useNetworkContext: vi.fn(),
  useAccountContext: vi.fn(),
}));

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <FeeAndTip />
    </I18nextProvider>
  );
};

describe("FeeAndTip", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => providersMocks);

    vi.mock("react-hook-form", () => reactHookFormMocks);

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: messageAPIMock.messageAPI,
    }));

    vi.mock("@src/xcm/extrinsics", () => ({
      XCM_MAPPING: {
        polkadot: {
          astar: vi.fn(() => ({
            method: "reserveTransferAssets",
            pallet: "xcmPallet",
            extrinsicValues: {},
          })),
        },
        "moonbeam-evm": {
          astar: vi.fn(() => ({
            method: "transfer",
            abi: "",
            contractAddress: "0x123",
            extrinsicValues: {},
          })),
        },
      },
    }));

    vi.mock("@src/utils/transfer", () => ({
      isKnownEstimatedFeeError: vi.fn(() => true),
      validateRecipientAddress: vi.fn(() => true),
    }));

    vi.mock("@polkadot/api", () => ({
      Keyring: vi.fn(() => ({
        addFromMnemonic: vi.fn(() => ({})),
      })),
    }));

    vi.mock("ethers", async () => {
      const actual = await vi.importActual("ethers");

      return {
        ...actual,
        Wallet: vi.fn(() => { }),
        Contract: vi.fn(() => ({
          estimateGas: {
            transfer: vi.fn(() => BigNumber.from("21000")),
          },
          populateTransaction: {
            transfer: vi.fn(() => { })
          },
        })),
      };
    });
  });

  describe("wasm", () => {
    beforeAll(() => {
      messageAPIMock.messageAPI.showKey.mockReturnValue(dataMocks.seed);

      providersMocks.useAccountContext.mockReturnValue({
        state: {
          selectedAccount: {
            type: "wasm",
          },
        },
      });

      providersMocks.useNetworkContext.mockReturnValue({
        state: {
          api: {
            query: {
              xcmPallet: {
                palletVersion: vi.fn(() => "1"),
              },
            },
            tx: {
              xcmPallet: {
                reserveTransferAssets: () =>
                  functionMocks.reserveTransferAssets(),
              },
              balances: {
                transferAllowDeath: () => functionMocks.transferAllowDeath(),
              },
              assets: {
                transfer: () => functionMocks.transfer(),
              },
            },
          },
        },
      });
    });

    it("should be a xcm transfer", async () => {
      reactHookFormMocks.useFormContext.mockReturnValue({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        watch: vi.fn((key: MOCK_WATCH_TYPE) => FORM_WASM_XCM_MOCK[key]),
        getValues: vi.fn(() => true), // only for isXcm value,
        setValue: vi.fn(),
      });

      renderComponent();

      await waitFor(() => {
        expect(functionMocks.reserveTransferAssets).toBeCalledTimes(1);
      });
    });

    it("should be a native asset transfer", async () => {
      reactHookFormMocks.useFormContext.mockReturnValue({
        watch: vi.fn((key: MOCK_WATCH_TYPE) => FORM_WASM_NATIVE_MOCK[key]),
        getValues: vi.fn(() => false), // only for isXcm value,
        setValue: vi.fn(),
      });

      renderComponent();

      await waitFor(() => {
        expect(functionMocks.transferAllowDeath).toBeCalledTimes(1);
      });
    });

    it("should be a asset transfer", async () => {
      reactHookFormMocks.useFormContext.mockReturnValue({
        watch: vi.fn((key: MOCK_WATCH_TYPE) => FORM_WASM_ASSET_TRANSFER_MOCK[key]),
        getValues: vi.fn(() => false), // only for isXcm value,
        setValue: vi.fn(),
      });

      renderComponent();

      await waitFor(() => {
        expect(functionMocks.transfer).toBeCalledTimes(1);
      });
    });
  });

  describe("evm", () => {
    beforeAll(() => {
      messageAPIMock.messageAPI.showKey.mockReturnValue(dataMocks.privateKey);

      providersMocks.useAccountContext.mockReturnValue({
        state: {
          selectedAccount: {
            type: "evm",
          },
        },
      });

      providersMocks.useNetworkContext.mockReturnValue({
        state: {
          api: {
            getFeeData: vi.fn(() => ({
              maxFeePerGas: BigNumber.from("1000000000000"),
              maxPriorityFeePerGas: BigNumber.from("1000000000000"),
            })),
            estimateGas: vi.fn(() => BigNumber.from("2100")),
          },
        },
      });
    });

    it("should be a xcm transfer", async () => {
      const setValueMock = vi.fn();

      reactHookFormMocks.useFormContext.mockReturnValue({
        watch: vi.fn((key: MOCK_WATCH_TYPE) => FORM_EVM_XCM_MOCK[key]),
        getValues: vi.fn(() => true), // only for isXcm value,
        setValue: setValueMock,
      });

      renderComponent();

      await waitFor(() => {
        expect(setValueMock).toHaveBeenCalled();
      });
    });

    it("should be a native asset transfer", async () => {
      const setValueMock = vi.fn();

      reactHookFormMocks.useFormContext.mockReturnValue({
        watch: vi.fn((key: MOCK_WATCH_TYPE) => FORM_EVM_NATIVE_MOCK[key]),
        getValues: vi.fn(() => false), // only for isXcm value,
        setValue: setValueMock,
      });

      renderComponent();

      await waitFor(() => {
        expect(setValueMock).toHaveBeenCalled();
      });
    });

    it("should be a erc20 transfer", async () => {

      const setValueMock = vi.fn();

      reactHookFormMocks.useFormContext.mockReturnValue({
        watch: vi.fn((key: MOCK_WATCH_TYPE) => FORM_EVM_ERC20_TRANSFER_MOCK[key]),
        getValues: vi.fn(() => false), // only for isXcm value,
        setValue: setValueMock,
      });

      renderComponent();

      await waitFor(() => {
        expect(setValueMock).toHaveBeenCalled();
      });

    })
  });
});
