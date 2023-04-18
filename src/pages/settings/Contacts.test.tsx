import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Contacts } from "./Contacts";
import i18n from "@src/utils/i18n";
import { en } from "@src/i18n";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Contacts />
    </I18nextProvider>
  );
};

describe("Contacts", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));

    vi.mock("@src/Extension");
  });

  it("should render", async () => {
    const _Extension = (await import("@src/Extension")).default;
    _Extension.getContacts = vi.fn().mockResolvedValue([
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
    const _Extension = (await import("@src/Extension")).default;
    _Extension.getContacts = vi.fn().mockResolvedValue([]);

    const { getByText } = renderComponent();

    await waitFor(() => {
      const container = getByText(en.common.no_contacts_found);
      expect(container).toBeDefined();
    });
  });

  it("should create contact", async () => {
    const saveContact = vi.fn().mockResolvedValue([]);
    const _Extension = (await import("@src/Extension")).default;
    _Extension.getContacts = vi.fn().mockResolvedValue([]);
    _Extension.saveContact = saveContact;

    const { getByText, getByTestId } = renderComponent();

    await waitFor(() => {
      const container = getByText(en.common.no_contacts_found);
      expect(container).toBeDefined();
    });

    const newContactButton = getByTestId("new-contact");

    act(() => {
      fireEvent.click(newContactButton);
    });

    const nameInput = getByTestId("name");
    const addressInput = getByTestId("address");

    act(() => {
      fireEvent.change(nameInput, { target: { value: "alice" } });
      fireEvent.change(addressInput, {
        target: { value: "0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627" },
      });
    });

    const saveButton = getByTestId("save");
    act(() => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => {
      expect(saveContact).toHaveBeenCalled();
    });
  });
});
