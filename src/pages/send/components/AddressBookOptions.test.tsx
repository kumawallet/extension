import i18n from "@src/utils/i18n";
import { render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { AddressBookOptions } from "./AddressBookOptions";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AddressBookOptions />
    </I18nextProvider>
  );
};

describe("AddressBookOptions", () => {
  beforeAll(() => {
    vi.mock("./AddressBook", () => ({
      AddressBook: (props: {
        contacts: { address: string }[];
        isLoading: boolean;
      }) => (
        <div data-testid="contacts-container">
          {props.contacts.map((contact, index) => {
            return <div key={index}>{contact.address}</div>;
          })}
        </div>
      ),
    }));

    vi.mock("./AddAddress", () => ({
      AddAddress: () => <div>AddAddress</div>,
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getRegistryAddresses: () => ({
          contacts: [
            {
              address: "0x1234567890123456789012345678901234567890",
            },
          ],
        }),
      },
    }));
  });

  describe("render", () => {
    it("should render", async () => {
      const { container, getByTestId } = renderComponent();

      await waitFor(() => {
        expect(container).toBeDefined();
        expect(getByTestId("contacts-container").children[0].innerHTML).toBe(
          "0x1234567890123456789012345678901234567890"
        );
      });
    });
  });
});
