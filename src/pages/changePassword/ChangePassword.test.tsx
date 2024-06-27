import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { ChangePassword } from "./ChangePassword";
import { act } from "react-dom/test-utils";

const functionMocks = {
  navigate: vi.fn(),
  changePassword: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ChangePassword />
    </I18nextProvider>
  );
};

describe("ChangePassword", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => functionMocks.navigate,
    }));

    vi.mock("@src/hooks", async () => {
      const actual = await vi.importActual("@src/hooks");

      return {
        ...actual,
        useToast: () => ({
          showErrorToast: vi.fn(),
          showSuccessToast: vi.fn(),
        }),
      };
    });

    vi.mock("react-hook-form", async () => {
      const actual = await vi.importActual("react-hook-form");

      return {
        ...actual,
        useForm: vi.fn(() => ({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handleSubmit: (cb: (props: any) => void) => () => {
            cb({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
              understand: false,
            });
          },
          register: vi.fn(() => ({
            ref: () => { },
          })),
          formState: {
            isValid: true,
          },
          watch: vi.fn(() => true),
          setValue: vi.fn(),
        })),
      };
    });

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        changePassword: () => functionMocks.changePassword(),
      },
    }));
  });

  describe("render", () => {
    it("should render the component", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });

  describe("change password", () => {
    it("should change password", async () => {
      const { getByTestId } = renderComponent();

      const currentPassword = getByTestId("current-password");
      const newPassword = getByTestId("new-password");
      const confirmPassword = getByTestId("confirm-password");
      const checkbox = getByTestId("understand-checkbox");

      fireEvent.change(currentPassword, { target: { value: "Test.123" } });
      fireEvent.change(newPassword, { target: { value: "Test.1234" } });
      fireEvent.change(confirmPassword, { target: { value: "Test.1234" } });
      fireEvent.change(checkbox, { target: { checked: true } });

      await waitFor(() => {
        const submitButton = getByTestId("submit-button") as HTMLInputElement;
        expect(submitButton.disabled).toBe(false);
      });

      await act(async () => {
        const submitButton = getByTestId("submit-button");
        fireEvent.click(submitButton);
      });

      await waitFor(() => expect(functionMocks.changePassword).toBeCalled());
    });
  });
});
