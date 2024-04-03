import i18n from "@src/utils/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Recipient } from "./Recipient";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Recipient />
    </I18nextProvider>
  );
};

describe("Recipient", () => {
  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        register: () => { },
        formState: {
          errors: {
            recipientAddress: {
              message: "error message"
            }
          }
        }
      }),
    }));

    vi.mock("./AddressBook", () => ({
      AddressBook: () => <div>AddressBook</div>
    }))
  })

  describe("render", () => {
    it("should render", () => {
      const component = renderComponent();
      expect(component).toBeDefined();
    });
  })

  describe("error message", () => {
    it("should render error message", () => {
      const { getByText } = renderComponent();

      expect(getByText("error message")).toBeDefined();
    });
  })


})