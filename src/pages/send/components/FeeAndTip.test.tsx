import { fireEvent, render, waitFor } from "@testing-library/react";
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
  isTipEnabled: true,
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

  it("should enabled tip", async () => {
    const setValueMock = vi.fn();

    reactHookFormMocks.useFormContext.mockReturnValue({
      watch: vi.fn((key: MOCK_WATCH_TYPE) => FORM_EVM_ERC20_TRANSFER_MOCK[key]),
      getValues: vi.fn(() => true), // only for isXcm value,
      setValue: setValueMock,
    });

    const { getByTestId } = renderComponent();



    await waitFor(() => {
      expect(getByTestId("tip")).toBeDefined();
    })

  })

  it('should set tip', async () => {
    const setValueMock = vi.fn();

    reactHookFormMocks.useFormContext.mockReturnValue({
      watch: vi.fn((key: MOCK_WATCH_TYPE) => FORM_EVM_ERC20_TRANSFER_MOCK[key]),
      getValues: vi.fn(() => true), // only for isXcm value,
      setValue: setValueMock,
    });

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("tip-input")).toBeDefined();
    })

    const tipInput = getByTestId("tip-input");

    fireEvent.change(tipInput, { target: { value: "0.0001" } });
    // fireEvent.input(tipInput, { target: { value: "0.0001" } });

    await waitFor(() => {
      expect(setValueMock).toHaveBeenCalled();
    })

  })
  it('should show loading animation when fee is loading', async () => {
    const setValueMock = vi.fn();
  
    reactHookFormMocks.useFormContext.mockReturnValue({
      watch: vi.fn((key: MOCK_WATCH_TYPE) => 
        key === 'isLoadingFee' ? true : FORM_EVM_ERC20_TRANSFER_MOCK[key]
      ),
      getValues: vi.fn(() => false),
      setValue: setValueMock,
    });
  
    const { container } = renderComponent();
  
    await waitFor(() => {
      const feeElement = container.querySelector('p.animate-pulse');
      expect(feeElement).not.to.be.null;
    });
  });
  
  it("should hide tip input when tip is disabled", async () => {
    const setValueMock = vi.fn();
  
    reactHookFormMocks.useFormContext.mockReturnValue({
      watch: vi.fn((key: MOCK_WATCH_TYPE) => {
        if (key === 'isTipEnabled') return false;
        return FORM_EVM_ERC20_TRANSFER_MOCK[key];
      }),
      getValues: vi.fn(() => false),
      setValue: setValueMock,
    });
  
    const { queryByTestId } = renderComponent();
  
    await waitFor(() => {
      expect(queryByTestId("tip")).toBeNull();
    });
  });
  
});
