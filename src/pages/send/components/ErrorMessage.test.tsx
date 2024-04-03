import { render } from "@testing-library/react";
import { SendTxForm } from "../Send";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { ErrorMessage } from "./ErrorMessage";

const WATCH_MOCK: Partial<SendTxForm> = {
  amount: "2",
  asset: {
    symbol: "DOT",
    decimals: 10,
    balance: "1",
  } as SendTxForm["asset"],
  fee: "0.1",
  originNetwork: {
    symbol: "DOT",
  } as SendTxForm["originNetwork"],
  isTipEnabled: true,
  tip: "0.1",
};

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
        watch: (key: string) => WATCH_MOCK[key],
      }),
    }));
  });

  it("should render", () => {
    const { container } = renderComponent();
    expect(container).toBeDefined();
  });


});
