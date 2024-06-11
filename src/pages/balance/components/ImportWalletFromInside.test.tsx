import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { ImportWalletFromInside } from "./ImportWalletFromInside";
import { PropsWithChildren } from "react";
import { AccountType } from "@src/accounts/types";
import { POLKADOT_SEED_MOCK } from "@src/tests/mocks/account-mocks";

const functionMocks = {
  onBack: vi.fn(),
  onFinish: vi.fn(),
  onClose: vi.fn(),
  importAccount: vi.fn(),
};


const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ImportWalletFromInside
        onBack={functionMocks.onBack}
        onFinish={functionMocks.onFinish}
        onClose={functionMocks.onClose}
      />
    </I18nextProvider>
  );
};


describe('ImportWalletFromInside', () => {

  beforeAll(() => {

    vi.mock("@src/pages/importWallet/components", () => ({
      ImportFromPrivateKey: () => <div data-testid="import-from-private-key" />,
      ImportFromSeed: () => <div data-testid="import-from-seed" />,
    }))

    vi.mock("@src/providers", () => ({
      useAccountContext: () => ({
        importAccount: () => functionMocks.importAccount(),
      }),
    }))


    vi.mock("react-hook-form", () => {
      return {
        FormProvider: ({ children }: PropsWithChildren) => children,
        useForm: () => ({
          handleSubmit: vi.fn((cb: (props: {
            type: string;
            seedLength: number;
            privateKeyOrSeed: string;
          }) => void) => () => {
            cb({
              type: "seed",
              seedLength: 12,
              privateKeyOrSeed: POLKADOT_SEED_MOCK
            });
          }),
          setValue: vi.fn(),
          watch: vi.fn(() => ({
            type: "seed",
            seedLength: 12,
            privateKeyOrSeed: POLKADOT_SEED_MOCK,
            accountTypesToImport: [AccountType.IMPORTED_EVM]
          })),
        }),
      };
    });
  })

  describe('render', () => {
    it("should render", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    })
  })

  describe('import from seed', () => {
    it('should call importAccount', async () => {
      const { getByTestId } = renderComponent();

      fireEvent.click(getByTestId('option1-button'));

      await waitFor(() => {
        expect(getByTestId('import-seed-button')).toBeDefined();
      })

      fireEvent.click(getByTestId('import-seed-button'));

      await waitFor(() => {
        expect(functionMocks.importAccount).toHaveBeenCalled();
      })
    })
  })

  describe('import from private key', () => {
    it('should call importAccount', async () => {
      const { getByTestId } = renderComponent();

      fireEvent.click(getByTestId('option2-button'));

      await waitFor(() => {
        expect(getByTestId('import-pk-button')).toBeDefined();
      })

      fireEvent.click(getByTestId('import-pk-button'));

      await waitFor(() => {
        expect(functionMocks.importAccount).toHaveBeenCalled();
      })
    })
  })

})