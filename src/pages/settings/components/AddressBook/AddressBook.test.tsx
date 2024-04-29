import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { AddressBook } from "./AddressBook";
import i18n from "@src/utils/i18n";
import { en } from "@src/i18n";
import { PropsWithChildren } from "react";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AddressBook />
    </I18nextProvider>
  );
};

const saveContact = vi.fn();

describe("AddressBook", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));
    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getContacts: vi.fn().mockReturnValue([]),
        saveContact: () => saveContact(),
      }
    }))
    vi.mock("./Add-Address/Add-Address", async () => {
      const original = (await vi.importActual('./Add-Address/Add-Address')) as object;

      return {
        ...original,
        Modal: ({ children }: PropsWithChildren) => <div data-testid="modal">{children}</div>,
      };

    })
  });

  it("should render", async () => {
    const Default = await import("@src/messageAPI/api")
    Default.messageAPI.getContacts = vi.fn().mockResolvedValue([
      {
        name: "alice",
        address: "0x123",
      },
      {
        name: "bob",
        address: "0x456",
      },
    ]);

    const { getAllByTestId } = renderComponent();

    await waitFor(() => {
      const container = getAllByTestId("contact");
      expect(container.length).toBe(2);
    });
  });

  it("should show no contacts", async () => {
    const Default = await import("@src/messageAPI/api")
    Default.messageAPI.getContacts = vi.fn().mockResolvedValue([]);

    const { getByText } = renderComponent();

    await waitFor(() => {
      const container = getByText(en.common.no_contacts_found);
      expect(container).toBeDefined();
    });
  });

  it("should create contact", async () => {
    const Default = await import("@src/messageAPI/api")
    Default.messageAPI.getContacts = vi.fn().mockResolvedValue([]);
    Default.messageAPI.saveContact = saveContact;

    const { getByText, getByTestId } = renderComponent();

    await waitFor(() => {
      const container = getByText(en.common.no_contacts_found);
      expect(container).toBeDefined();
    });

    const newContactButton = getByTestId("new-contact");
    fireEvent.click(newContactButton);

    await waitFor(() =>
      getByTestId("name")
    )

    const nameInput = getByTestId("name");
    const addressInput = getByTestId("address");

    act(() => {
      fireEvent.change(nameInput, { target: { value: "alice" } });
      fireEvent.change(addressInput, {
        target: { value: "0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627" },
      });
    });

    const saveButton = getByTestId("save-button");
    act(() => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => {
      expect(saveContact).toHaveBeenCalled();
    });
  });
});
