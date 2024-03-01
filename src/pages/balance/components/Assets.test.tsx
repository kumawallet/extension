import { render, screen } from "@testing-library/react";
import { Assets } from "./Assets";
import i18n from "@src/utils/i18n";
import { I18nextProvider } from "react-i18next";

const MOCKS_ASSETS = [
  {
    id: "1",
    name: "ASTR",
    amount: 10,
    symbol: "ASTR",
    decimals: 18,
    balance: 4.5,
  },
];

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Assets />
    </I18nextProvider>
  );
};

describe("Assets", () => {
  beforeAll(() => {
    // mock react-rotuer-dom
    vi.mock("react-router-dom", () => ({
      useNavigate: vi.fn().mockReturnValue(vi.fn),
    }));
    vi.mock("@src/providers", () => ({
      useNetworkContext: vi.fn().mockReturnValue({
        state: {
          type: "EVM",
          api: {},
        },
      }),
      useAssetContext: vi.fn().mockReturnValue({
        state: {
          assets: [
            {
              id: "1",
              name: "ASTR",
              amount: 10,
              symbol: "ASTR",
              decimals: 18,
              balance: 4.5,
            },
          ],
          isLoadingAssets: false,
        },
      }),
    }));
    vi.mock("@src/utils/env", () => ({
      version: "1.0.0",
      getWebAPI: () => ({
        tabs: {
          getCurrent: () => Promise.resolve(undefined),
          create: () => vi.fn(),
        },
        runtime: {
          getURL: vi.fn(),
          connect: vi.fn().mockReturnValue({
            onMessage: {
              addListener: vi.fn(),
            },
          }),
        },
      }),
    }))
  });
  it("should render assets", () => {
    renderComponent();

    expect(screen.getByText(MOCKS_ASSETS[0].symbol)).toBeDefined();
  });
});
