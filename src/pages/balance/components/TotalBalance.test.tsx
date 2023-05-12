import i18n from "@src/utils/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { TotalBalance } from "./TotalBalance";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <TotalBalance />
    </I18nextProvider>
  );
};

describe("TotalBalance", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useAssetContext: () => ({
        state: {
          assets: [
            {
              amount: 100,
            },
          ],
        },
      }),
      useAccountContext: () => ({
        state: {
          selectedAccount: {},
        },
      }),
    }));

    vi.mock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));
  });

  it("should render", () => {
    const { container } = renderComponent();
    expect(container).toBeDefined();
  });

  it("should render total balance", () => {
    const { getByTestId } = renderComponent();

    const balance = getByTestId("balance");

    expect(balance.innerHTML).include("100");
  });
});
