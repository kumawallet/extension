import i18n from "@src/utils/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Security } from "./Security";
import { CHANGE_PASSWORD } from "@src/routes/paths";

const functionMocks = {
  useNavigate: vi.fn(),
}

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Security />
    </I18nextProvider>
  );
};

describe('Security', () => {

  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => functionMocks.useNavigate,
    }))

    vi.mock("@src/utils/env", () => ({
      version: "1.0.0",
      getWebAPI: () => ({
        tabs: {
          getCurrent: () => Promise.resolve(undefined),
        },
        runtime: {
          getURL: vi.fn(),
          connect: vi.fn().mockReturnValue({
            onMessage: {
              addListener: vi.fn(),
            },
            onDisconnect: {
              addListener: vi.fn(),
            },
          }),
        },
      }),
    }))
  })

  describe('render', () => {
    it("should render correctly", () => {
      const { container } = renderComponent();

      expect(container).toBeDefined();
    });
  })

  describe('select option', () => {
    it('should navigate to change password page', () => {
      const { getByTestId } = renderComponent();

      getByTestId("change-password").click();

      expect(functionMocks.useNavigate).toHaveBeenCalledWith(CHANGE_PASSWORD);
    })

  })


})