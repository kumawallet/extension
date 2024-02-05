import { en } from "@src/i18n";
import { AccountForm, AddAccountFormProps } from "./AccountForm";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";

const callback = vi.fn();

const importAccountCB = vi.fn();

const importAccountProps: AddAccountFormProps = {
  title: en.account_form.import.title,
  onSubmitFn: () => importAccountCB(),
  buttonText: en.account_form.import.button_text,
  signUp: true,
  fields: {
    privateKeyOrSeed: true,
    accountType: true,
  },
  afterSubmitMessage: en.account_form.import.submit_message,
  goAfterSubmit: "",
  backButton: true,
  callback: () => callback(),
};

const createAccountCB = vi.fn().mockReturnValue(true);

const createAccountProps: AddAccountFormProps = {
  title: en.account_form.create_or_derivate.title,
  onSubmitFn: () => createAccountCB(),
  buttonText: en.account_form.create_or_derivate.button_text,
  signUp: true,
  afterSubmitMessage: en.account_form.create_or_derivate.submit_message,
  goAfterSubmit: "",
  backButton: true,
  callback: () => callback(),
};

const restorePasswordCB = vi.fn();

const restorePasswordProps: AddAccountFormProps = {
  title: en.account_form.create_or_derivate.title,
  onSubmitFn: () => restorePasswordCB(),
  buttonText: en.account_form.create_or_derivate.button_text,
  signUp: true,
  fields: {
    privateKeyOrSeed: true,
  },
  afterSubmitMessage: en.account_form.create_or_derivate.submit_message,
  goAfterSubmit: "",
  backButton: true,
  callback: () => callback(),
};

const deriveAccountCB = vi.fn().mockReturnValue(true);

const deriveAccountProps: AddAccountFormProps = {
  title: en.account_form.create_or_derivate.title,
  onSubmitFn: () => deriveAccountCB(),
  buttonText: en.account_form.create_or_derivate.button_text,
  signUp: true,
  afterSubmitMessage: en.account_form.create_or_derivate.submit_message,
  goAfterSubmit: "",
  backButton: true,
  callback: () => callback(),
};

const renderCoponent = (props: AddAccountFormProps) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AccountForm {...props} />
    </I18nextProvider>
  );
};

describe("AccountForm", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: vi.fn(),
    }));

    vi.mock("@src/providers", () => ({
      useAccountContext: vi.fn().mockReturnValue({
        state: {
          selectedAccount: {},
        },
      }),
      useThemeContext: () => ({
        color: "red",
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

  describe("import account", () => {
    it("should render", () => {
      renderCoponent(importAccountProps);
      const title = screen.getByText(importAccountProps.title);
      const accountTypeSelect = screen.getByText(
        en.account_form.form.account_type
      );
      const privateKeyOrSeed = screen.getByTestId("privateKeyOrSeed");

      expect(title.innerHTML).toEqual(importAccountProps.title);
      expect(privateKeyOrSeed).toBeDefined();
      expect(accountTypeSelect).toBeDefined();
    });
  });

  describe("create account", () => {
    it("should render", () => {
      renderCoponent(createAccountProps);
      const title = screen.getByText(createAccountProps.title);
      expect(title.innerHTML).toEqual(createAccountProps.title);
    });

    it("should submit", async () => {
      renderCoponent(createAccountProps);
      const nameInput = screen.getByPlaceholderText(
        en.account_form.form.account_name_placeholder
      );
      const passwordInput = screen.getByTestId("password");
      const confirmPasswordInput = screen.getByTestId("confirmPassword");
      const { firstChild: submitButton } = screen.getByTestId("submitbtn");

      await act(() => {
        fireEvent.change(nameInput, { target: { value: "new account" } });
        fireEvent.change(passwordInput, { target: { value: "Test.123" } });
        fireEvent.change(confirmPasswordInput, {
          target: { value: "Test.123" },
        });
      });
      await act(() => {
        fireEvent.click(submitButton as ChildNode);
      });
      expect(createAccountCB).toHaveBeenCalled();

      waitFor(() => {
        const successMessage = screen.getByText(
          createAccountProps.afterSubmitMessage
        );
        expect(successMessage.innerHTML).toBe(
          createAccountProps.afterSubmitMessage
        );
      });
    });
  });

  describe("restore password", () => {
    it("should render", () => {
      renderCoponent(restorePasswordProps);
      const title = screen.getByText(restorePasswordProps.title);
      const privateKeyOrSeed = screen.getByTestId("privateKeyOrSeed");

      expect(title.innerHTML).toEqual(restorePasswordProps.title);
      expect(privateKeyOrSeed).toBeDefined();
    });
  });

  describe("derive account", () => {
    it("should render", () => {
      renderCoponent(deriveAccountProps);
      const title = screen.getByText(deriveAccountProps.title);
      expect(title.innerHTML).toEqual(deriveAccountProps.title);
    });
  });
});
