import i18n from "@src/utils/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Settings } from "./Settings";


const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Settings />
    </I18nextProvider>
  );
};

describe('Settings', () => {

  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: vi.fn(),
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

  it("should render correctly", () => {
    const { container, getByTestId } = renderComponent();

    expect(container).toBeDefined();
    expect(getByTestId("version").innerHTML).toBe("1.0.0");
  });

})