import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { RecoveryPhrase } from "./RecoveryPhrase";

const dataMocks = {
  seed: "SEED SEDD SEED SEDD SEED SEDD SEED SEDD SEED SEDD SEED SEDD",
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <RecoveryPhrase />
    </I18nextProvider>
  );
};

describe("RecoveryPhrase", () => {
  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: vi.fn(() => ({
        getValues: vi.fn(() => dataMocks.seed),
      })),
    }));
  });

  describe("render", () => {
    it("should render", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });

  describe("show seed", () => {
    it("should show seed", async () => {
      const { getByTestId } = renderComponent();

      const hideButton = getByTestId("hide-button");

      fireEvent.click(hideButton);

      await waitFor(() => {
        const bgBlur = getByTestId('bg-blur')
        expect(bgBlur.className).not.includes('backdrop-blur')
      })
    });
  });
});
