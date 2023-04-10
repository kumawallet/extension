import { selectedEVMAccountMock } from "@src/tests/mocks/account-mocks";
import { selectedEVMChainMock } from "@src/tests/mocks/chain-mocks";
import i18n from "@src/utils/i18n";
import {
  act,
  fireEvent,
  getAllByText,
  getByText,
  render,
  waitFor,
} from "@testing-library/react";
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
              address: "0x1234",
            },
          ],
          ownAccounts: [
            {
              name: "test",
              address: "0x1235",
            },
          ],
          recent: [
            {
              address: "0x1236",
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
      expect(getAllByText("0x1234").length).toBe(1);
    });
  });

  it("should filter", async () => {
    const { getByTestId, getAllByText } = renderComponent();

    const input = getByTestId("destination-input");

    act(() => {
      fireEvent.click(input);
    });

    await waitFor(() => {
      const address = getAllByText("0x1234");

      expect(address.length).toBe(1);
    });

    act(() => {
      fireEvent.change(input, { target: { value: "0x123" } });
    });

    await waitFor(() => {
      const address = getAllByText("0x1234");

      expect(address.length).toBe(1);
    });
  });
});
