import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { TotalBalance } from "./TotalBalance";
import { act } from "react-dom/test-utils";
import { AccountType } from "@src/accounts/types";
import { SUBTRATE_CHAINS } from "@src/constants/chainsData";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <TotalBalance />
    </I18nextProvider>
  );
};

const updateAccountName = vi.fn();

describe("TotalBalance", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useAssetContext: () => ({
        state: {
          assets: {
            "0x123": {
              "polkadot": {
                assets: [
                  {
                    amount: "100",
                  },
                ]
              }
            }
          },
        },
        loadAssets: vi.fn(),
      }),
      useNetworkContext: () => ({
        state: {
          selectedChain: SUBTRATE_CHAINS[0],
          type: AccountType.EVM,
          api: null
        },
      }),
      useAccountContext: () => ({
        state: {
          selectedAccount: {},
        },
        updateAccountName: () => updateAccountName(),
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

  it("should hide balance", async () => {
    const { getByTestId } = renderComponent();

    const hideBalance = getByTestId("hide-balance");

    act(() => {
      fireEvent.click(hideBalance);
    });

    await waitFor(() => {
      expect(getByTestId("show-balance")).toBeDefined();
    });
  });

});
