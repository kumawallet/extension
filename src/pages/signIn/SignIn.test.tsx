import { en } from "@src/i18n";
import i18n from "@src/utils/i18n";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { SignIn } from "./SignIn";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <SignIn />
    </I18nextProvider>
  );
};

const navigate = vi.fn();
const signIn = vi.fn();
describe("SignIn", () => {
  beforeEach(() => {
    renderComponent();

    vi.mock("@src/providers", () => ({
      useThemeContext: () => ({
        color: "red",
      }),
    }));
    vi.mock("react-router-dom", () => ({
      useNavigate: () => () => navigate(),
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        signIn: () => signIn(),
      },

    }))

  });

  it("should render", () => {
    expect(screen.getByText(en.sign_in.signin_button_text)).exist;
  });

  it("should sign in", async () => {
    const passwordInput = screen.getByPlaceholderText(
      en.sign_in.password_placeholder
    );
    const button = screen.getByText(en.sign_in.signin_button_text);

    await act(() => {
      fireEvent.change(passwordInput, { target: { value: "Test.123" } });
      fireEvent.click(button);
    });

    expect(signIn).toHaveBeenCalledOnce();
  });

  it("should go to forgot password", async () => {
    const forgotPasswordLink = screen.getByText(en.sign_in.forgot_password);

    await act(() => {
      fireEvent.click(forgotPasswordLink);
    });
    expect(navigate).toHaveBeenCalled();
  });
});
