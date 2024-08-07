import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { Welcome } from "./Welcome";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import en from "@src/i18n/en.json";
import { CREATE_ACCOUNT, IMPORT_ACCOUNT } from "@src/routes/paths";

const useNavigateMock = vi.fn();

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Welcome />
    </I18nextProvider>
  );
};

describe("Welcome", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => (route: string) => useNavigateMock(route),
    }));
  });

  it("should render", () => {
    renderComponent();
    expect(screen.getByText(en.welcome.welcome_message)).toBeTruthy();
  });

  it("should navigate to create account", async () => {
    renderComponent();
    fireEvent.click(screen.getByText(en.welcome.create_wallet));
    await waitFor(() => expect(useNavigateMock).toBeCalledWith(CREATE_ACCOUNT));
  });

  it("should navigate to import account", async () => {
    renderComponent();
    fireEvent.click(screen.getByText(en.welcome.import_wallet));
    await waitFor(() => expect(useNavigateMock).toBeCalledWith(IMPORT_ACCOUNT));
  });
});
