import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Send, SendTxForm } from "./Send";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";

const functionMocks = {
  sendSubstrateTx: vi.fn(),
  sendEvmTx: vi.fn(),
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

    vi.mock("@src/hooks", () => ({
      useToast: () => ({
        showSuccessToast: vi.fn(),
        showErrorToast: vi.fn(),
      }),
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        sendSubstrateTx: () => functionMocks.sendSubstrateTx(),
        sendEvmTx: () => functionMocks.sendEvmTx(),
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
        },
      }),
      useAccountContext: () => ({
        state: {
          selectedAccount: {
            value: {
              address: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
            },
          },
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

  describe("send substrate tx", () => {
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
        expect(functionMocks.sendSubstrateTx).toHaveBeenCalled();
      });
    });
  });

  describe("send evm tx", () => {
    it("should call sendEvmTx", async () => {
      useFormMock.handleSubmit.mockImplementation(
        (cb: (props: SendTxForm) => void) => () => {
          cb({
            recipientAddress:
              "0x5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
            senderAddress: "0x5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
            amount: "1",
            asset: {
              id: "ETH",
              symbol: "ETH",
              decimals: 18,
              balance: "100",
            },
            fee: "1000000000",
            haveSufficientBalance: true,
            isTipEnabled: false,
            originNetwork: EVM_CHAINS[0],
            targetNetwork: EVM_CHAINS[0],
            evmTx: {
              gasLimit: "100000",
              gasPrice: "1000000000",
              nonce: "0",
            },
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
        expect(functionMocks.sendEvmTx).toHaveBeenCalled();
      });
    });
  })
});
