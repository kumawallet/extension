import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Send, SendTxForm } from "./Send";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";
import { ChainType } from "@src/types";

const functionMocks = {
  sendTx: vi.fn(),
};

const useFormMock = vi.hoisted(() => ({
  handleSubmit: vi.fn(),
}));

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Send />
    </I18nextProvider>
  );
};

describe("Send", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));

    vi.mock("@src/hooks", async () => {
      const actual = await vi.importActual("@src/hooks");

      return {
        ...actual,
        useToast: () => ({
          showSuccessToast: vi.fn(),
          showErrorToast: vi.fn(),
        }),
      }
    });

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        sendTx: () => functionMocks.sendTx(),
      },
    }));

    vi.mock("react-hook-form", async () => {
      const actual = await vi.importActual("react-hook-form");
      return {
        ...actual,
        useForm: () => ({
          watch: vi.fn((key: string) => {
            switch (key) {
              case "isLoadingFee":
                return false
              case "haveSufficientBalance":
                return true
              default:
                return true;
            }

          }),
          handleSubmit: useFormMock.handleSubmit,
          formState: {
            isValid: true,
          },
        }),
      };
    });

    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: {
          selectedChain: {
            symbol: "DOT",
            decimals: 10,
          },
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
      }),
      useAccountContext: () => ({
        state: {
          selectedAccount: {
            type: ChainType.WASM,
            value: {
              address: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
            },
          },
          accounts: [
            {
              type: ChainType.WASM,
              value: {
                address: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
              },
            }
          ]
        },
      }),
    }));

    vi.mock("./components/Recipient", () => ({
      Recipient: () => <div>Recipient</div>,
    }));

    vi.mock("./components/AssetToSend", () => ({
      AssetToSend: () => <div>AssetToSend</div>,
    }));

    vi.mock("./components/FeeAndTip", () => ({
      FeeAndTip: () => <div>FeeAndTip</div>,
    }));

    vi.mock("./components/ErrorMessage", () => ({
      ErrorMessage: () => <div>ErrorMessage</div>,
    }));

    vi.mock("./components/SendTxResume", () => ({
      SendTxResume: () => <div data-testid="SendTxResume">SendTxResume</div>,
    }));
  });

  describe("render", () => {
    it("should render", async () => {
      const { container } = renderComponent();

      await waitFor(() => {
        expect(container).toBeDefined();
      });
    });
  });

  describe("send tx", () => {
    it("should call sendSubstrateTx", async () => {
      useFormMock.handleSubmit.mockImplementation(
        (cb: (props: SendTxForm) => void) => () => {
          cb({
            recipientAddress:
              "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
            senderAddress: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
            amount: "1",
            asset: {
              id: "DOT",
              symbol: "DOT",
              decimals: 10,
              balance: "100",
            },
            fee: "1000000000",
            haveSufficientBalance: true,
            isTipEnabled: false,
            originNetwork: SUBTRATE_CHAINS[0],
            targetNetwork: SUBTRATE_CHAINS[0],
            extrinsicHash: "0x123",
          });
        }
      );

      const { getByTestId } = renderComponent();

      const button = getByTestId("send-button");

      fireEvent.click(button);

      await waitFor(() => {
        expect(getByTestId("SendTxResume")).toBeDefined();
      });

      fireEvent.click(button);

      await waitFor(() => {
        expect(functionMocks.sendTx).toHaveBeenCalled();
      });
    });
  });
});
