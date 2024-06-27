import i18n from "@src/utils/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { CreatePasswordStep } from "./CreatePasswordStep";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <CreatePasswordStep />
    </I18nextProvider>
  );
};

describe("CreatePasswordStep", () => {
  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: vi.fn(() => ({
        setValue: vi.fn(),
        getValues: vi.fn(() => true),
        register: vi.fn(() => ({
          ref: () => { },
        })),
        formState: {
          errors: {},
        },
      })),
    }));
  });

  describe("render", () => {
    it("should render", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });
});
