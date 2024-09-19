import i18n from "@src/utils/i18n";
import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Actions } from "./Actions";
import { SEND, SWAP } from "@src/routes/paths";
import '@testing-library/jest-dom'; 
import { AccountType } from "@src/accounts/types";

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

const useAccountContextMock = vi.hoisted(() => ({
   
    selectedAccount: {
      key: "IMPORTED_WASM-EEgxDFmLS2",
      type: "IMPORTED_WASM",
      value: {
        address: "EEgxDFmLS2",
        isDerivable: true,
        keyring: "IMPORTED_WASM",
        name: "Account",
      },
  
}}));

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
          } ,
        },
      })),
      useAccountContext: () => ({
        state: useAccountContextMock
      }),
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

      const swapAction = container.children[1] as HTMLElement;

      fireEvent.click(swapAction);

      expect(functionMocks.useNavigate).toHaveBeenCalledWith(SWAP);
    });

    it("should disable the swap button when selectedAccount type is 'ol'", async() => {
      useAccountContextMock.selectedAccount ={
              key: "OL-82a42737759",
              value: {
                  address: "82a42737759",
                  isDerivable: true,
                  keyring: AccountType.OL,
                  "name": "Account 6"
              },
            type: AccountType.OL
          }
      const { getByTestId } = renderComponent();
      const container = getByTestId("actions-container");
      const swapAction = container.children[1] as HTMLElement;
      expect(swapAction).toHaveAttribute('disabled');

      fireEvent.click(swapAction);
      expect(functionMocks.useNavigate).not.toHaveBeenCalledWith(SWAP);
    });
  });
});


