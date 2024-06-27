import { AddressBook } from "./AddressBook";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";

const dataMocks = {
  contacts: [
    {
      name: "John Doe",
      address: "0x1234567890123456789012345678901234567890",
    },
  ],
};

const functionMocks = {
  setValue: vi.fn(),
  getRegistryAddresses: vi.fn().mockResolvedValue({
    contacts: dataMocks.contacts,
  }),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AddressBook
        contacts={[{
          name: "John Doe",
          address: "0x1234567890123456789012345678901234567890",
        }]}
        isLoading={false}

      />
    </I18nextProvider>
  );
};

describe("AddressBook", () => {
  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        setValue: () => functionMocks.setValue(),
      }),
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getRegistryAddresses: () => functionMocks.getRegistryAddresses(),
      },
    }));
  });

  describe("render", () => {
    it("should render", () => {
      const component = renderComponent;
      expect(component).toBeDefined();
    });
  });

  describe("select contact", () => {
    it("should select contact", async () => {
      const { getByTestId } = renderComponent();

      const openAddressBook = getByTestId("open-address-book");

      act(() => fireEvent.click(openAddressBook));

      await waitFor(() => expect(getByTestId("select-contact")).toBeDefined());

      const selectContactButton = getByTestId("select-contact");

      act(() => fireEvent.click(selectContactButton));

      await waitFor(() => {
        expect(functionMocks.setValue).toHaveBeenCalled();
      });
    });
  });
});
