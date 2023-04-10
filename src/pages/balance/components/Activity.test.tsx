import i18n from "@src/utils/i18n";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Activity } from "./Activity";
import { AccountType } from "@src/accounts/types";
import { activitysMock } from "@src/tests/mocks/activity-mocks";
import { selectedEVMAccountMock } from "@src/tests/mocks/account-mocks";
import { en } from "@src/i18n";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Activity />
    </I18nextProvider>
  );
};

describe("Actvity", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: {
          type: AccountType.EVM,
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

    vi.mock("@src/Extension", () => ({
      default: {
        getRegistryAddresses: vi.fn().mockReturnValue({
          contacts: [],
          ownAccounts: [],
        }),
        getAllChains: vi.fn().mockReturnValue({
          getAll: vi.fn().mockReturnValue([
            {
              name: "test",
              explorer: {
                evm: "http://test.com",
                wasm: "wss://test.com",
              },
            },
          ]),
        }),
      },
    }));
  });

  it("should render", () => {
    const { container } = renderComponent();
    expect(container).toBeDefined();
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
