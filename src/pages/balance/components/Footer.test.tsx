import { fireEvent, render, waitFor } from "@testing-library/react";
import { Footer } from "./Footer";

const functionMocks = {
  navigate: vi.fn(),
  signOut: vi.fn(),
};

const renderComponent = () => {
  return render(<Footer />);
};

describe("Footer", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => functionMocks.navigate,
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        signOut: () => functionMocks.signOut,
      },
    }));

    vi.mock('@src/utils/utils', () => ({
      isInPopup: () => true
    }))

    vi.mock("@src/utils/env", () => ({
      version: "1.0.0"
    }));
  });

  describe("render", () => {
    it("should render", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });

  describe("select option", () => {
    it("should sign out", async () => {
      const { getByTestId } = renderComponent();
      const signOutButton = getByTestId('sign-out')


      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(functionMocks.navigate).toHaveBeenCalled()
      })
    });

    it("should call full screen", async () => {
      const { getByTestId } = renderComponent();
      const signOutButton = getByTestId('full-screen')

      const createTab = vi.spyOn(chrome.tabs, 'create')

      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(createTab).toHaveBeenCalled()
      })
    });

    it("should call settings", async () => {
      const { getByTestId } = renderComponent();
      const signOutButton = getByTestId('settings')


      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(functionMocks.navigate).toHaveBeenCalled()
      })
    });
  });
});
