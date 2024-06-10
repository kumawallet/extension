import i18n from "@src/utils/i18n";
import { act, fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { ForgotPass } from "./ForgotPass";

const functionMocks = {
  resetWallet: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ForgotPass />
    </I18nextProvider>
  );
};

describe("ForgotPass", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: vi.fn(),
    }));

    vi.mock("@src/hooks", () => ({
      useToast: vi.fn(() => ({
        showErrorToast: vi.fn(),
      })),
      useLoading: vi.fn(() => ({
        starLoading: vi.fn(),
        endLoading: vi.fn(),
      })),
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        resetWallet: () => functionMocks.resetWallet(),
      },
    }));
  });

  describe("render", () => {
    it("should render the component", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });

  describe("resetWallet", () => {
    it("should call resetWallet", async () => {
      const { getByTestId } = renderComponent();

      act(() => {
        fireEvent.click(getByTestId("checkbox"));
      });

      act(() => {
        fireEvent.click(getByTestId("reset-button"));
      });

      expect(functionMocks.resetWallet).toHaveBeenCalled();
    });
  });
});
