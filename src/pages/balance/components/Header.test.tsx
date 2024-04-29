import { render } from "@testing-library/react";
import { Header } from "./Header";

const renderComponent = () => {
  return render(<Header />);
};

describe("Header", () => {
  beforeAll(() => {
    vi.mock("./AccountList", () => ({
      AccountList: () => <div data-testid="AccountList" />,
    }));

    vi.mock("./ChainSelector", () => ({
      ChainSelector: () => <div data-testid="ChainSelector" />,
    }));
  });

  describe("render", () => {
    it("should render", () => {
      const { getByTestId } = renderComponent();

      expect(getByTestId("AccountList")).toBeDefined();
      expect(getByTestId("ChainSelector")).toBeDefined();
    });
  });
});
