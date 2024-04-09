import { I18nextProvider } from "react-i18next";
import { ImportFromPrivateKey } from "./ImportFromPrivateKey";
import { render } from "@testing-library/react";
import i18n from "@src/utils/i18n";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ImportFromPrivateKey />
    </I18nextProvider>
  );
};

describe("ImportFromPrivateKey", () => {
  vi.mock("react-hook-form", () => ({
    useFormContext: () => ({
      formState: { errors: {} },
      register: () => ({ ref: () => { } }),
    }),
  }));

  describe("render", () => {
    it("should render the component", () => {
      const { getByTestId } = renderComponent();
      expect(getByTestId("privateKey")).toBeDefined();
    });
  });
});
