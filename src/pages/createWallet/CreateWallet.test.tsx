import { act, render, waitFor } from "@testing-library/react";
import { CreateWallet } from "./CreateWallet";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { BALANCE } from "@src/routes/paths";

const useCreateWalletMock = vi.hoisted(() => ({
  step: 1,
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  goToWelcome: vi.fn(),
}));

const functionsMocks = {
  navigate: vi.fn(),
}

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <CreateWallet />
    </I18nextProvider>
  );
};

describe("CreateWallet", () => {
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
      ConfirmRecoveryPhrase: () => <div data-testid="ConfirmRecoveryPhrase" />,
    }));

    vi.mock("react-router-dom", () => ({
      useNavigate: () => (path: string) => functionsMocks.navigate(path),
    }));

    vi.mock("@src/providers", () => ({
      useAccountContext: vi.fn(() => ({
        createAccount: vi.fn(() => true),
        getAllAccounts: vi.fn(),
      })),
      useNetworkContext: vi.fn(() => ({
        initializeNetwork: vi.fn(),
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
            password: "Test.123",
            confirmPassword: "Test.123",
            agreeWithTerms: true,
            confirmSeed: "SEED SEED",
            seed: "SEED SEED",
          })),
        })),
      };
    });

    vi.mock("./hooks/useCreateWallet", () => ({
      useCreateWallet: () => useCreateWalletMock,
    }));

    vi.mock("@src/utils/env", () => ({
      version: "1.0.0",
      getWebAPI: () => ({
        tabs: {
          getCurrent: () => Promise.resolve(undefined),
        },
        runtime: {
          getURL: vi.fn(),
          connect: vi.fn().mockReturnValue({
            onMessage: {
              addListener: vi.fn(),
            },
            onDisconnect: {
              addListener: vi.fn(),
            },
          }),
        },
      }),
    }));
  });

  describe("render", () => {
    it("should render CreatePasswordStep", () => {
      const { getByTestId } = renderComponent();
      expect(getByTestId("CreatePasswordStep")).toBeDefined();
    });
  });

  describe("step 1", () => {
    it("should go to step 2", () => {
      const { getByTestId } = renderComponent();

      useCreateWalletMock.step = 1;
      const nextStep = getByTestId("footer-button");
      nextStep?.click();
      expect(useCreateWalletMock.nextStep).toHaveBeenCalled();
    });
  });

  describe("step 2", () => {
    it("should render RecoveryPhrase", () => {
      useCreateWalletMock.step = 2;

      const { getByTestId } = renderComponent();

      expect(getByTestId("RecoveryPhrase")).toBeDefined();
    });

    it("should go to step 3", () => {
      useCreateWalletMock.step = 2;
      const { getByTestId } = renderComponent();

      const nextStep = getByTestId("footer-button");
      nextStep?.click();
      expect(useCreateWalletMock.nextStep).toHaveBeenCalled();
    });
  });

  describe("step 3", () => {
    it("should render ConfirmRecoveryPhrase", () => {
      useCreateWalletMock.step = 3;

      const { getByTestId } = renderComponent();

      expect(getByTestId("ConfirmRecoveryPhrase")).toBeDefined();
    });

    it("should go to step 4", async () => {
      useCreateWalletMock.step = 3;
      const { getByTestId } = renderComponent();

      const nextStep = getByTestId("footer-button");

      act(() => {
        nextStep?.click();
      });

      await waitFor(() =>
        expect(useCreateWalletMock.nextStep).toHaveBeenCalled()
      );
    });
  });

  describe("step 4", () => {
    it("should render Congrats", () => {
      useCreateWalletMock.step = 4;

      const { getByTestId } = renderComponent();

      expect(getByTestId("Congrats")).toBeDefined();
    });

    it("should go to balance", () => {

      useCreateWalletMock.step = 4;
      const { getByTestId } = renderComponent();

      const nextStep = getByTestId("footer-button");

      act(() => {
        nextStep?.click();
      });


      expect(functionsMocks.navigate).toHaveBeenCalledWith(BALANCE);
    })
  });
});
