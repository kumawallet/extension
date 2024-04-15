import i18n from "@src/utils/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Balance } from "./Balance";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Balance />
    </I18nextProvider>
  );
};

describe("Balance", () => {
  beforeAll(() => {
    vi.mock("./components", () => ({
      Activity: () => <div data-testid="Activity"></div>,
      Assets: () => <div data-testid="Assets"></div>,
      Header: () => <div data-testid="Header"></div>,
      Footer: () => <div data-testid="Footer"></div>,
      TotalBalance: () => <div data-testid="TotalBalance"></div>,
      Actions: () => <div data-testid="Actions"></div>,
      AccountSelected: () => <div data-testid="AccountSelected"></div>,
    }));

    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: { selectedChain: { name: "chain" } },
      }),
    }));

    vi.mock("react-router-dom", () => ({
      useLocation: () => ({ state: "" }),
    }))
  });

  describe("render", () => {
    it("should render", async () => {
      const { container } = renderComponent()
      expect(container).toBeDefined();
    });
  });
});
