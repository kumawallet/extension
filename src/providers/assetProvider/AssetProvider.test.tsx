import { render } from "@testing-library/react";
import { AssetProvider, useAssetContext } from "./AssetProvider";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { AssetBalance } from "@src/storage/entities/AssetBalance";


const TestComponent = () => {
  const {
    state: {
      assets,
      isLoadingAssets
    }
  } = useAssetContext();

  return (
    <>
      <div>{isLoadingAssets}</div>
      <div data-testid="assets">{JSON.stringify(assets)}</div>
    </>
  );
}

const ASSETS_MOCK: AssetBalance = {
  ["5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F" as string]: {
    ["polkadot" as string]: {
      subs: [],
      assets: [
        {
          id: "-1",
          amount: 10,
          balance: "10",
          decimals: 10,
          symbol: "DOT",
          usdPrice: 6.5,
        }
      ]
    }
  }
}

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AssetProvider>
        <TestComponent />
      </AssetProvider>
    </I18nextProvider>
  );
};

describe("AssetProvider", () => {
  beforeAll(() => {
    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getAssetsBalance: (cb: (assets: AssetBalance) => void) => cb(ASSETS_MOCK)
      }
    }))
  })

  it("should render assets", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("assets").innerHTML).toBe(JSON.stringify(ASSETS_MOCK));
  })
})