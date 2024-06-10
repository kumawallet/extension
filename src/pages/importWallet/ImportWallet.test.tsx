import { render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { ImportWallet } from "./ImportWallet";
import { act } from "react-dom/test-utils";
import { AccountType } from "@src/accounts/types";

const useCreateWalletMock = vi.hoisted(() => ({
  step: 1,
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  goToWelcome: vi.fn(),
  setStep: vi.fn(),
}));

const functionsMocks = {
  navigate: vi.fn(),
}

const useFormMock = vi.hoisted(() => ({
  getValues: vi.fn()
}))

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ImportWallet />
    </I18nextProvider>
  );
};

describe("ImportWallet", () => {
  beforeAll(() => {
    vi.mock("@src/components/accountForm", async () => {
      const actual = await vi.importActual("@src/components/accountForm/");
      return {
        ...actual,
        CreatePasswordStep: () => <div data-testid="CreatePasswordStep" />,
        Congrats: () => <div data-testid="Congrats" />,
        RecoveryPhrase: () => <div data-testid="RecoveryPhrase" />,
      };
    });

    vi.mock("./components", () => ({
      ImportFromPrivateKey: () => <div data-testid="ImportFromPrivateKey" />,
      ImportFromSeed: () => <div data-testid="ImportFromSeed" />,
      SelectImportFrom: () => <div data-testid="SelectImportFrom" />,
    }));

    vi.mock("react-router-dom", () => ({
      useNavigate: () => (path: string) => functionsMocks.navigate(path),
    }));

    vi.mock("@src/providers", () => ({
      useAccountContext: vi.fn(() => ({
        importAccount: vi.fn(() => true),
        getAllAccounts: vi.fn(),
      })),
      useNetworkContext: vi.fn(() => ({
        refreshNetworks: vi.fn(),
      })),
    }));

    vi.mock("react-hook-form", async () => {
      const actual = await vi.importActual("react-hook-form");

      return {
        ...actual,
        useForm: vi.fn(() => ({
          handleSubmit:
            (
              cb: (props: {
                password: string;
                confirmPassword: string;
                agreeWithTerms: boolean;
                confirmSeed: string;
                seed: string;
              }) => void
            ) =>
              () =>
                cb({
                  password: "Test.123",
                  confirmPassword: "Test.123",
                  agreeWithTerms: true,
                  confirmSeed: "SEED SEED",
                  seed: "SEED SEED",
                }),
          watch: vi.fn(() => ({
            type: "seed",
            seedLength: 12,
            privateKeyOrSeed: "SEED SEED SEED SEED SEED SEED SEED SEED SEED SEED SEED SEED",
            password: "Test.123",
            confirmPassword: "Test.123",
            agreeWithTerms: true,
            accountTypesToImport: [AccountType.EVM, AccountType.IMPORTED_OL]
          })),
          getValues: useFormMock.getValues,
          clearErrors: vi.fn(),
        })),
      };
    });

    vi.mock("../createWallet/hooks/useCreateWallet", () => ({
      useCreateWallet: () => useCreateWalletMock,
    }));
  });

  describe("render", () => {
    it("should render CreatePasswordStep", () => {
      const { getByTestId } = renderComponent();
      expect(getByTestId("SelectImportFrom")).toBeDefined();
    });
  });

  describe("step 2", () => {
    it('should render ImportFromSeed', () => {
      useCreateWalletMock.step = 2;
      useFormMock.getValues.mockReturnValue("seed");

      const { getByTestId } = renderComponent();

      expect(getByTestId("ImportFromSeed")).toBeDefined();
    })

    it('should render ImportFromPrivateKey', () => {
      useCreateWalletMock.step = 2;
      useFormMock.getValues.mockReturnValue("privateKey");

      const { getByTestId } = renderComponent();

      expect(getByTestId("ImportFromPrivateKey")).toBeDefined();
    })

    it("should go to step 3", () => {
      const { getByTestId } = renderComponent();

      useCreateWalletMock.step = 2;
      const nextStep = getByTestId("footer-button");
      nextStep?.click();
      expect(useCreateWalletMock.nextStep).toHaveBeenCalled();
    });

  });

  describe('step 3', () => {
    it('should render CreatePasswordStep', () => {
      useCreateWalletMock.step = 3;

      const { getByTestId } = renderComponent();

      expect(getByTestId("CreatePasswordStep")).toBeDefined();
    });

    it("should go to step 4", async () => {
      useCreateWalletMock.step = 3;
      const { getByTestId } = renderComponent();

      const nextStep = getByTestId("footer-button");

      act(() => {
        nextStep?.click();
      })

      await waitFor(() =>
        expect(useCreateWalletMock.nextStep).toHaveBeenCalled())
    });
  })

});
