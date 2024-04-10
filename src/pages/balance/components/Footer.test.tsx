import { fireEvent, render, waitFor } from "@testing-library/react";
import { Footer } from "./Footer";

const functionMocks = {
  navigate: vi.fn(),
  signOut: vi.fn(),
  createTab: vi.fn()
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
      version: "1.0.0",
      getWebAPI: () => ({
        tabs: {
          create: () => functionMocks.createTab(),
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


      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(functionMocks.createTab).toHaveBeenCalled()
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
