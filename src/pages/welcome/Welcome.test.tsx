import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { Welcome } from "./Welcome";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import en from "@src/i18n/en.json";

const useNavigateMock = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => () => useNavigateMock(),
}));

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Welcome />
    </I18nextProvider>
  );
};

describe("Welcome", () => {
  it("should render", () => {
    renderComponent();
    expect(screen.getByText(en.welcome.welcome_message));
  });

  it("should call goToAccount function", () => {
    renderComponent();

    fireEvent.click(screen.getByText(en.welcome.button_text));

    expect(useNavigateMock).toHaveBeenCalled();
  });
});
