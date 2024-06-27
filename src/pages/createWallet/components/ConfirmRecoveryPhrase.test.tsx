import i18n from "@src/utils/i18n";
import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { ConfirmRecoveryPhrase } from "./ConfirmRecoveryPhrase";
import { POLKADOT_SEED_MOCK } from "@src/tests/mocks/account-mocks";



const getValuesMock: {
  [key: string]: string;
} = {
  seed: POLKADOT_SEED_MOCK,
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ConfirmRecoveryPhrase />
    </I18nextProvider>
  );
};
describe("ConfirmRecoveryPhrase", () => {
  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: vi.fn(() => ({
        getValues: vi.fn((key: string) => getValuesMock[key]),
        setValue: vi.fn(),
        formState: {
          errors: {},
        },
      })),
    }));
  });

  describe("render", () => {
    it("should render the component", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });

  describe("words to select", () => {
    it("should render the words to select", () => {
      const { getByTestId } = renderComponent();

      const wordsContainer = getByTestId("words-to-select");

      expect(wordsContainer.children.length).toEqual(3);
    });

    it("should select all word", async () => {
      const { getByTestId } = renderComponent();

      const wordsContainer = getByTestId("words-to-select");

      const buttons = [...wordsContainer.children];

      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[0]);

      const wordsSelected = getByTestId("words-to-select");

      expect(wordsSelected.children.length).toEqual(0);
    });
  });
});
