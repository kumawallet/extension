import { selectedEVMAccountMock } from "@src/tests/mocks/account-mocks";
import { render } from "@testing-library/react";
import { ConfirmTx } from "./ConfirmTx";
import { en } from "@src/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";

const onConfirm = vi.fn();

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ConfirmTx
        onBack={() => vi.fn()}
        fee={{
          estimatedFee: "100",
          estimatedTotal: "100",
          gasLimit: "100",
        }}
        onConfirm={() => onConfirm()}
        isLoading={false}
      />
    </I18nextProvider>
  );
};

describe("ConfirmTx", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: {
          selectedNetwork: selectedEVMAccountMock,
        },
      }),
      useAccountContext: () => ({
        state: {
          selectedAccount: selectedEVMAccountMock,
        },
      }),
      useThemeContext: () => ({
        color: "red",
      }),
    }));

    vi.mock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));

    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        getValues: (value: string) => {
          switch (value) {
            case "amount":
              return "100";
            case "destinationAccount":
              return "0x123";
            case "to":
              return {
                name: "Ethereum",
              };
            case "from":
              return {
                name: "Ethereum",
              };
            default:
              return "";
          }
        },
        watch: (value: string) => {
          switch (value) {
            case "asset":
              return {
                name: "Ethereum",
                symbol: "ETH"
              };
            default:
              return "";
          }
        },
      }),
    }));
    vi.mock("@src/utils/env", () => ({
      version: "1.0.0",
      getWebAPI: () => ({
        tabs: {
          getCurrent: () => Promise.resolve(undefined),
          create: () => vi.fn(),
        },
        runtime: {
          getURL: vi.fn(),
          connect: vi.fn().mockReturnValue({
            onMessage: {
              addListener: vi.fn(),
            },
          }),
        },
      }),
    }))
  });

  it("should render correctly", () => {
    const { getByTestId } = renderComponent();

    const originChain = getByTestId("origin-chain");
    const destinationChain = getByTestId("destination-chain");


    expect(originChain.innerHTML).contain("Ethereum");
    expect(destinationChain.innerHTML).contain("Ethereum");

    const originAsset = getByTestId("origin-asset");
    const destinationAsset = getByTestId("destination-asset");

    expect(originAsset.innerHTML).contain("ETH");
    expect(destinationAsset.innerHTML).contain("ETH");
  });

  it("should call onConfirm when confirm button is clicked", () => {
    const { getByText } = renderComponent();

    const confirmButton = getByText(en.send.confirm);

    confirmButton.click();

    expect(onConfirm).toHaveBeenCalled();
  });
});
