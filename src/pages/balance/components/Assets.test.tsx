import { render, screen } from "@testing-library/react";
import { Asset } from "../Balance";
import { Assets } from "./Assets";

const MOCKS_ASSETS: Asset[] = [
  {
    name: "ASTR",
    amount: 10,
    symbol: "ASTR",
    decimals: 18,
    usdPrice: 4.5,
  },
];

const renderComponent = () => {
  return render(<Assets assets={MOCKS_ASSETS} isLoading={false} />);
};

describe("Assets", () => {
  it("should render assets", () => {
    renderComponent();

    expect(screen.getByText(MOCKS_ASSETS[0].symbol)).toBeDefined();
  });
});
