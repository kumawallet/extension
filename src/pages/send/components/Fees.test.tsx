import i18n from "@src/utils/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Fees } from "./Fees";

const evmFees = {
  gasLimit: "21000",
  estimatedFee: "0.000000000000000001",
  estimatedTotal: "0.000000000000000001",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderComponent = (fee: any) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Fees {...fee} />
    </I18nextProvider>
  );
};

describe("Fees", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: {
          selectedChain: {
            type: "evm",
          },
        },
      }),
    }));

    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        watch: (value: string) => {
          if (value === "amount") return "1";
          if (value === "asset") return { id: "-1", symbol: "ETH" };
          return undefined;
        },
      }),
    }));
  });

  it("should render native assets fees", () => {
    const { getByText } = renderComponent(evmFees);
    expect(getByText("21000 gwei")).toBeDefined();
  });

  it("should render no native assets fees", async () => {
    const rhf = await import("react-hook-form");
    rhf.useFormContext = vi.fn().mockReturnValue({
      watch: (value: string) => {
        if (value === "amount") return "1";
        if (value === "asset") return { id: "1", symbol: "USDT" };
        return undefined;
      },
    });

    const { container } = renderComponent({
      ...evmFees,
      estimatedTotal: "1 USDT + 0.001 ETH",
    });

    expect(container.innerHTML).contain("1 USDT");
  });
});
