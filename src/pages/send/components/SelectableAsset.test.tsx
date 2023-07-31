import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { SelectableAsset } from "./SelectableAsset";
import { selectedEVMChainMock } from "@src/tests/mocks/chain-mocks";

const onChangeAsset = vi.fn();

const renderComponent = () => {
  return render(<SelectableAsset onChangeAsset={() => onChangeAsset()} />);
};

describe("SelectableAsset", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useLocation: () => ({
        state: null,
      }),
    }));

    vi.mock("@src/providers", () => ({
      useAssetContext: vi.fn().mockReturnValue({
        state: {
          assets: [
            {
              id: "1",
              symbol: "ETH",
              balance: 10,
            },
            {
              id: "2",
              symbol: "USDT",
              balance: 2,
            },
          ],
        },
      }),
      useNetworkContext: () => ({
        state: {
          selectedChain: selectedEVMChainMock,
        },
      }),
      useThemeContext: () => ({
        color: "red",
      }),
    }));

    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        getValues: () => ({
          name: "Moonbeam",
        }),
        watch: () => ({
          name: "Moonbeam",
        }),
      }),
    }));
  });

  it("should render", async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      const selectedAsset = getByTestId("selected-asset");
      expect(selectedAsset.innerHTML).contain("ETH");
    });
  });

  it("should render all assets", async () => {
    const { getByTestId, getByText } = renderComponent();

    const selectAsset = getByTestId("selected-button");

    act(() => {
      fireEvent.click(selectAsset);
    });

    await waitFor(() => {
      expect(getByText("USDT")).toBeDefined();
    });
  });

  it("should call change asset", async () => {
    const { getByTestId, getByText } = renderComponent();

    const selectAsset = getByTestId("selected-button");

    act(() => {
      fireEvent.click(selectAsset);
    });

    await waitFor(() => {
      const address = getByText("USDT");

      act(() => {
        fireEvent.click(address);
      });
    });

    expect(onChangeAsset).toBeCalledTimes(5);
  });
});
