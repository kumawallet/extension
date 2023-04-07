import i18n from "@src/utils/i18n";
import { act, fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { ManageAssets } from "./ManageAssets";
import { CHAINS } from "@src/constants/chains";
import { AccountType } from "@src/accounts/types";
import { en } from "@src/i18n";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ManageAssets />
    </I18nextProvider>
  );
};

const showErrorToast = vi.fn();

describe("ManageAssets", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useAssetContext: () => ({
        loadAssets: vi.fn(),
      }),
      useNetworkContext: () => ({
        state: {
          selectedChain: CHAINS[0].chains[3],
          type: AccountType.EVM,
        },
      }),
    }));

    vi.mock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));

    vi.mock("@src/Extension");

    vi.mock("@src/hooks", () => ({
      useToast: vi.fn().mockReturnValue({
        showErrorToast: () => showErrorToast(),
      }),
    }));
  });

  it("should render evm", () => {
    const { container } = renderComponent();
    expect(container).toBeDefined();
  });

  it("should fill the form and submit", async () => {
    // mock extension
    const _Extension = (await import("@src/Extension")).default;

    const addAsset = vi.fn();
    _Extension.addAsset = addAsset;

    const { getByText, getByTestId } = renderComponent();

    const addressInput = getByTestId("address");
    const symbolInput = getByTestId("symbol");
    const decimalsInput = getByTestId("decimals");

    const submitButton = getByText(en.manage_assets.add);

    expect(addressInput).toBeDefined();
    expect(symbolInput).toBeDefined();
    expect(decimalsInput).toBeDefined();
    expect(submitButton).toBeDefined();

    await act(() => {
      fireEvent.change(addressInput, {
        target: { value: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
      });
      fireEvent.change(symbolInput, { target: { value: "ABC" } });
      fireEvent.change(decimalsInput, { target: { value: "12" } });
    });

    await act(() => {
      fireEvent.click(submitButton);
    });

    expect(addAsset).toHaveBeenCalled();
  });

  it("should show error on submit", async () => {
    // mock extension
    const _Extension = (await import("@src/Extension")).default;

    const addAsset = vi.fn().mockRejectedValue(new Error("error"));
    _Extension.addAsset = addAsset;

    const { getByText, getByTestId } = renderComponent();

    const addressInput = getByTestId("address");
    const symbolInput = getByTestId("symbol");
    const decimalsInput = getByTestId("decimals");

    const submitButton = getByText(en.manage_assets.add);

    expect(addressInput).toBeDefined();
    expect(symbolInput).toBeDefined();
    expect(decimalsInput).toBeDefined();
    expect(submitButton).toBeDefined();

    await act(() => {
      fireEvent.change(addressInput, {
        target: { value: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
      });
      fireEvent.change(symbolInput, { target: { value: "ABC" } });
      fireEvent.change(decimalsInput, { target: { value: "12" } });
    });

    await act(() => {
      fireEvent.click(submitButton);
    });

    expect(showErrorToast).toHaveBeenCalled();
  });
});
