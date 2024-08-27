import { POLKADOT_ACCOUNT_MOCK } from "@src/tests/mocks/account-mocks";
import { Asset as IAsset } from "@src/types";
import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Asset } from "./Asset";

const functionMocks = {
  navigate: vi.fn(),
}

const dataMocks = {
  asset: {
    balance: "1",
    symbol: "DOT",
    amount: 1,
    accounts: {
      [POLKADOT_ACCOUNT_MOCK.value?.address as string]: {
        balance: 1,
        amount: 1,
        symbol: "DOT",
        decimals: 10,
        id: "-1",
      }
    },
    id: "-1",

  } as IAsset
}

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      {/* <Asset
        asset={dataMocks.asset}
      /> */}
    </I18nextProvider>
  );
};

describe("Asset", () => {

  vi.mock("react-router-dom", () => ({
    useNavigate: () => functionMocks.navigate
  }))

  it("should render the component", () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });

  it("should go to se multiple accounts", async () => {
    const { getByTestId } = renderComponent();
    const asset = getByTestId("asset");

    fireEvent.click(asset)
    await waitFor(() => {

      expect(functionMocks.navigate).toHaveBeenCalled();
    })
  })

  it("should go to send", async () => {
    const { getByTestId } = renderComponent();
    const sendButton = getByTestId("send");

    fireEvent.click(sendButton)
    await waitFor(() => {
      expect(functionMocks.navigate).toHaveBeenCalled();
    })
  })

})
