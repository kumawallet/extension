import i18n from "@src/utils/i18n";
import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Actions } from "./Actions";
import { SEND, SWAP } from "@src/routes/paths";

const functionMocks = {
  useNavigate: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Actions />
    </I18nextProvider>
  );
};

describe("Actions", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => functionMocks.useNavigate,
    }));

    vi.mock("@src/providers", () => ({
      useNetworkContext: vi.fn(() => ({
        state: {
          selectedChain: {
            id: "polkadot",
            type: "wasm",
          },
        },
      })),
    }));
  });

  describe("render", () => {
    it("should render", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });

  describe("select option", () => {
    it("should navigate to send page", () => {
      const { getByTestId } = renderComponent();

      const container = getByTestId("actions-container");

      const sendAction = container.children[0] as HTMLElement;

      fireEvent.click(sendAction);

      expect(functionMocks.useNavigate).toHaveBeenCalledWith(SEND);
    });

    it("should navigate to swap page", () => {
      const { getByTestId } = renderComponent();

      const container = getByTestId("actions-container");

      const sendAction = container.children[1] as HTMLElement;

      fireEvent.click(sendAction);

      expect(functionMocks.useNavigate).toHaveBeenCalledWith(SWAP);
    });
  });
});
