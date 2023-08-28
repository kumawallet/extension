import { selectedEVMAccountMock } from "@src/tests/mocks/account-mocks";
import { selectedEVMChainMock } from "@src/tests/mocks/chain-mocks";
import i18n from "@src/utils/i18n";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Destination } from "./Destination";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Destination />
    </I18nextProvider>
  );
};

describe("Destination", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: {
          selectedChain: selectedEVMChainMock,
          type: "EVM"
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
          contacts: [
            {
              name: "test",
              address: "0xbE1b7B9e75b96449a9286e3dE0fa0e6E89428968",
            },
          ],
          ownAccounts: [
            {
              name: "test",
              address: "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac",
            },
          ],
          recent: [
            {
              address: "0x798d4Ba9baf0064Ec19eB4F0a1a45785ae9D6DFc",
            },
          ],
        }),
      },
    }));

    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        register: vi.fn().mockReturnValue({
          onChange: vi.fn(),
        }),
        watch: vi.fn().mockImplementation((val: string) => {

          if (val === "isXcm") return false

          if (val === "to") return {
            name: "Ethereum",
            supportedAccounts: ["EVM"],
          }

        }),

      }),
    }));
  });

  it("should render options", async () => {
    const { getByTestId, getAllByText } = renderComponent();

    const input = getByTestId("destination-input");

    act(() => {
      fireEvent.click(input);
    });
    await waitFor(() => {
      expect(getAllByText("0xbE1b7B9e75b96449a9286e3dE0fa0e6E89428968").length).toBe(1);
    });
  });

  it("should filter", async () => {
    const { getByTestId, getAllByText } = renderComponent();

    const input = getByTestId("destination-input");

    act(() => {
      fireEvent.click(input);
    });

    await waitFor(() => {
      const address = getAllByText("0xbE1b7B9e75b96449a9286e3dE0fa0e6E89428968");

      expect(address.length).toBe(1);
    });

    act(() => {
      fireEvent.change(input, { target: { value: "0xbE1b7B9e75b96449a9286e3dE0fa0e6E89428968" } });
    });

    await waitFor(() => {
      const address = getAllByText("0xbE1b7B9e75b96449a9286e3dE0fa0e6E89428968");

      expect(address.length).toBe(1);
    });
  });
});
