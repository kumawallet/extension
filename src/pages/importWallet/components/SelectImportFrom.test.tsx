import i18n from "@src/utils/i18n";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { SelectImportFrom } from "./SelectImportFrom";

const functionMocks = {
  onContinue: vi.fn(),
  handleSubmit: vi.fn(() => vi.fn()),
  setValue: vi.fn(),
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <SelectImportFrom onContinue={functionMocks.onContinue} />
    </I18nextProvider>
  );
};

describe("SelectImportFrom", () => {
  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        handleSubmit: functionMocks.handleSubmit,
        setValue: functionMocks.setValue,
      }),
    }));
  });

  describe("render", () => {
    it("should render the component", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });

  describe('select option', () => {

    it('should call onContinue with seed', () => {
      const { getByTestId } = renderComponent();
      const seedButton = getByTestId('import-from-seed-phrase');
      seedButton.click();
      expect(functionMocks.setValue).toHaveBeenCalledWith('type', 'seed');
      expect(functionMocks.handleSubmit).toHaveBeenCalledWith(functionMocks.onContinue);
    });

    it('should call onContinue with privateKey', () => {
      const { getByTestId } = renderComponent();
      const privateKeyButton = getByTestId('import-from-private-key');
      privateKeyButton.click();
      expect(functionMocks.setValue).toHaveBeenCalledWith('type', 'privateKey');
      expect(functionMocks.handleSubmit).toHaveBeenCalledWith(functionMocks.onContinue);
    });

  })
});
