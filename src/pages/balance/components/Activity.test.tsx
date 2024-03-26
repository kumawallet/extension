import i18n from "@src/utils/i18n";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Activity } from "./Activity";
import { activitysMock } from "@src/tests/mocks/activity-mocks";
import { selectedEVMAccountMock } from "@src/tests/mocks/account-mocks";
import { en } from "@src/i18n";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Activity />
    </I18nextProvider>
  );
};

describe("Actvity", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: vi.fn().mockReturnValue(vi.fn()),
    }))

    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: {
          chains: [
            {
              title: "wasm_based",
              chains: SUBTRATE_CHAINS.filter((chain) => !chain.isTestnet),
            },
            {
              title: "evm_based",
              chains: EVM_CHAINS.filter((chain) => !chain.isTestnet),
            },
          ],
        },
      }),
      useTxContext: () => ({
        state: {
          activity: activitysMock,
        },
      }),
      useAccountContext: () => ({
        state: {
          selectedAccount: selectedEVMAccountMock,
        },
      }),
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {

        getRegistryAddresses: vi.fn().mockReturnValue({
          contacts: [],
          ownAccounts: [],
        }),
      }
    }));
  });

  it("should render", async () => {
    const { getByTestId } = renderComponent();
    await waitFor(() => {
      expect(getByTestId("search-input")).toBeDefined();
    }, {
      timeout: 10000,
    });
  });

  it("should filter by network", async () => {
    const { container, getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("search-input")).toBeDefined();
    });

    const searchInput = await getByTestId("search-input");
    act(() => {
      fireEvent.change(searchInput, { target: { value: "ether" } });
    });
    await waitFor(() => {
      expect(container.innerHTML).not.contain(en.activity.empty);
    });
  });
});
