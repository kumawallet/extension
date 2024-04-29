import i18n from "@src/utils/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Congrats } from "./Congrats";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Congrats />
    </I18nextProvider>
  );
};

describe("Congrats", () => {
  it("render", () => {
    const { container } = renderComponent();

    expect(container).toBeDefined();
  });
});
