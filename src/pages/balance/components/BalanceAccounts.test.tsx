import i18n from "@src/utils/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { BalanceAccounts } from "./BalanceAccounts";
import { ChainType } from "@src/types";


const functionMock = {
  navigate: vi.fn()
}


const dataMock = {
  location: {
    state: {
      asset: {
        accounts: {
          "WASM-5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F": {
            balance: "1000000000000000",
            decimals: 12,
            symbol: "DOT"
          }
        }
      }
    }
  },
  accounts: [
    {
      key: "WASM-5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
      value: {
        address: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
        name: "Account 1"
      },
      type: ChainType.WASM
    }
  ]
}

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <BalanceAccounts />
    </I18nextProvider>
  );
};

describe("BalanceAccounts", () => {

  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => functionMock.navigate,
      useLocation: () => dataMock.location
    }))

    vi.mock("@src/providers", () => ({
      useAccountContext: () => ({
        state: {
          accounts: dataMock.accounts
        }
      })
    }))
  })

  it("should render the component", () => {
    const { container } = renderComponent();
    expect(container).toBeDefined();
  });

  it('should render wallet', () => {
    const { getByTestId } = renderComponent();
    const wallet = getByTestId("wallets");
    expect(wallet.children?.length).toBeGreaterThan(0);
  })

})