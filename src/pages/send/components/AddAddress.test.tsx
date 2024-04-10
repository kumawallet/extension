import { I18nextProvider } from "react-i18next";
import { AddAddress } from "./AddAddress";
import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";

const functionMocks = {
  onSaveContact: vi.fn(),
  saveContact: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AddAddress onSaveContact={functionMocks.onSaveContact} />
    </I18nextProvider>
  );
};

describe("AddAddress", () => {
  beforeAll(() => {
    vi.mock("@src/hooks", async () => {
      const actual = await vi.importActual("@src/hooks");
      return {
        ...actual,
        useToast: vi.fn().mockReturnValue({
          showErrorToast: vi.fn(),
        }),
      };
    });

    vi.mock("react-hook-form", async () => {
      const actual = await vi.importActual("react-hook-form");
      return {
        ...actual,
        useForm: vi.fn().mockReturnValue({
          handleSubmit: vi.fn(
            (cb: (props: { name: string; address: string }) => void) => () => {
              cb({
                name: "name",
                address: "0x1234567890123456789012345678901234567890",
              });
            }
          ),
          reset: vi.fn(),
          formState: {
            errors: {},
          },
        }),
        useFormContext: () => ({
          register: vi.fn(() => ({
            ref: () => { },
          })),
          watch: vi
            .fn()
            .mockReturnValue("0x1234567890123456789012345678901234567890"),
          formState: {
            errors: {},
          },
        }),
      }

    });

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        saveContact: () => functionMocks.saveContact(),
      },
    }));
  });

  describe('render', () => {
    it('should render', () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    })
  })

  describe('save contact', () => {
    it('should save contact', async () => {
      const { getByTestId } = renderComponent();

      fireEvent.click(getByTestId("open-address-book"));

      await waitFor(() => {
        expect(getByTestId('save-button')).toBeDefined();
      })

      fireEvent.click(getByTestId('save-button'));

      await waitFor(() => {
        expect(functionMocks.saveContact).toHaveBeenCalled();
      })
    })
  })
});
