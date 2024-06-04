import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { AutoLock } from "./AutoLock";

const functionMocks = {
  setAutoLock: vi.fn(),
  navigate: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AutoLock />
    </I18nextProvider>
  );
};

describe("AutoLock", () => {
  beforeAll(() => {
    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getLock: vi.fn().mockReturnValue(60),
        setAutoLock: () => functionMocks.setAutoLock(),
      },
    }));

    vi.mock("react-router-dom", () => ({
      useNavigate: vi.fn().mockReturnValue(() => functionMocks.navigate()),
    }));
  });

  it("should render", async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      expect(container).toBeDefined();
    });
  });

  it("should set new time lock", async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("time-options").children.length).toBe(6);
    });

    const firstOption = getByTestId("time-options").children[0];

    fireEvent.click(firstOption);

    await waitFor(() => {
      expect(functionMocks.setAutoLock).toHaveBeenCalled();
    });
  });

  it("should return", async () => {
    const { getByTestId } = renderComponent();

    const backButton = getByTestId("back-button");

    fireEvent.click(backButton);

    await waitFor(() => {
      expect(functionMocks.navigate).toHaveBeenCalled();
    });
  });
});
