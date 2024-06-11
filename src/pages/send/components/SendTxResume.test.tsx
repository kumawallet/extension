import i18n from "@src/utils/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { SendTxResume } from "./SendTxResume";
import { cropAccount } from "@src/utils/account-utils";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <SendTxResume />
    </I18nextProvider>
  );
};

const dataMocks: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
} = {
  formMocks: {
    senderAddress: "0x1234567890123456789012345678901234567890",
    recipientAddress: "0x1234567890123456789012345678901234567890",
    originNetwork: {
      logo: "logo",
      id: "id",
      symbol: "symbol",
      decimals: 18,
    },
    targetNetwork: {
      logo: "logo",
      id: "id-2",
      symbol: "symbol",
      decimals: 18,
    },
    amount: 10,
    asset: {
      symbol: "symbol",
    },
    fee: "10",
    tip: 10,
  },
};

const functionMocks = {
  getValues: vi.fn((key: string) => {
    return dataMocks.formMocks[key];
  }),
};

describe("SendTxResume", () => {
  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        getValues: (key: string) => functionMocks.getValues(key),
      }),
    }));
  });

  describe("render", () => {
    it("should render", () => {
      const component = renderComponent();
      expect(component).toBeDefined();
    });
  });

  describe("transaction", () => {
    it("should return transaction", () => {
      const { container } = renderComponent();

      expect(container.innerHTML.toString()).contains(
        cropAccount(dataMocks.formMocks.senderAddress, 12)
      );
      expect(container.innerHTML.toString()).contains(
        cropAccount(dataMocks.formMocks.recipientAddress, 12)
      );
      expect(container.innerHTML.toString()).contains(
        dataMocks.formMocks.amount
      );
    });
  });
});
