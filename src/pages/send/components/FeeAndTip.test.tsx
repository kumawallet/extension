import { render, waitFor } from "@testing-library/react";
import { SendTxForm } from "../Send";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { FeeAndTip } from "./FeeAndTip";

type MOCK_WATCH_TYPE = keyof Partial<SendTxForm>;

const FEE_MOCK = "1000000000000";

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
    getFee: vi.fn((cb: (fee: string) => void) => cb(FEE_MOCK)),
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

    vi.mock("@src/utils/transfer", () => ({
      isKnownEstimatedFeeError: vi.fn(() => true),
      validateRecipientAddress: vi.fn(() => true),
    }));
  });

  it("should show fee", async () => {
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
  });
});
