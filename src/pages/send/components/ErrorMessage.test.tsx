import { render } from "@testing-library/react";
import { SendTxForm } from "../Send";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { ErrorMessage } from "./ErrorMessage";

type MOCK_WATCH_TYPE = keyof Partial<SendTxForm>;

const WATCH_NATIVE_MOCK: Partial<SendTxForm> = {
  amount: "2",
  asset: {
    symbol: "DOT",
    decimals: 10,
    balance: "1",
  } as SendTxForm["asset"],
  fee: "100000000",
  originNetwork: {
    symbol: "DOT",
  } as SendTxForm["originNetwork"],
  isTipEnabled: true,
  tip: "100000000",
};

const WATCH_XCM_MOCK: Partial<SendTxForm> = {
  amount: "2",
  asset: {
    symbol: "USDT",
    decimals: 6,
    balance: "1",
  } as SendTxForm["asset"],
  fee: "100000000",
  originNetwork: {
    symbol: "ASTR",
  } as SendTxForm["originNetwork"],
  isTipEnabled: true,
  tip: "100000000",
};

const useFormContextMock = vi.hoisted(() => ({
  watch: (key: MOCK_WATCH_TYPE) => WATCH_NATIVE_MOCK[key],
}));

const functionMocks = {
  setValue: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ErrorMessage />
    </I18nextProvider>
  );
};

describe("ErrorMessage", () => {
  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        setValue: functionMocks.setValue,
        watch: useFormContextMock.watch,
      }),
    }));
  });

  describe("render", () => {
    it("should render with native asset", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });

    it("should render with xcm asset", () => {
      useFormContextMock.watch = (key: MOCK_WATCH_TYPE) => WATCH_XCM_MOCK[key];
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });
});
