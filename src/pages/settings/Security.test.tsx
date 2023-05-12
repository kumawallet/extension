import i18n from "@src/utils/i18n";
import { I18nextProvider } from "react-i18next";
import { Security } from "./Security";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";

const getSelectedAccount = vi.fn();
const getTrustedSites = vi.fn().mockReturnValue(["site1", "site2"]);
const removeTrustedSite = vi.fn();

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Security />
    </I18nextProvider>
  );
};

describe("Security", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useAccountContext: () => ({
        getSelectedAccount: () => getSelectedAccount(),
      }),
    }));

    vi.mock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));

    vi.mock("@src/Extension", () => ({
      default: {
        resetWallet: () => vi.fn(),
        showPrivateKey: () => "",
        showSeed: () => "seed",
        getTrustedSites: () => getTrustedSites(),
        removeTrustedSite: () => removeTrustedSite(),
      },
    }));
  });

  it("should render", async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      expect(container).toBeDefined();
    });
  });

  it("should show sites", async () => {
    const { container, getByTestId, getByText } = renderComponent();

    await waitFor(() => {
      expect(container).toBeDefined();
    });

    await waitFor(() => {
      expect(getByTestId("show-sites")).toBeDefined();
    });

    const showSitesContainer = getByTestId("show-sites");

    act(() => {
      fireEvent.click(showSitesContainer.children[0]);
    });

    await waitFor(() => {
      expect(getByText("site1")).toBeDefined();
    });
  });
});
