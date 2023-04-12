import { selectedEVMChainMock } from "@src/tests/mocks/chain-mocks";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { BN } from "bn.js";
import { I18nextProvider } from "react-i18next";
import { EvmForm } from "./EvmForm";
import i18n from "@src/utils/i18n";
import { en } from "@src/i18n";
import { BigNumber } from "ethers";

const confirmTx = vi.fn();

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <EvmForm confirmTx={() => confirmTx()} />
    </I18nextProvider>
  );
};

describe("EvmForm", () => {
  beforeAll(async () => {
    //mock CommonFormFields
    vi.mock("./CommonFormFields", () => ({
      CommonFormFields: () => <div>CommonFormFields</div>,
    }));

    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: {
          api: {
            getGasPrice: vi.fn().mockReturnValue(new BN("1000000000")),
            estimateGas: vi.fn().mockReturnValue(new BN("21000")),
            getFeeData: vi.fn().mockReturnValue({
              maxFeePerGas: new BN("1000000000"),
              maxPriorityFeePerGas: new BN("1000000000"),
            }),
          },
          selectedChain: selectedEVMChainMock,
        },
      }),
      useAssetContext: () => ({
        state: {
          assets: [
            {
              id: "-1",
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
              balance: new BN("1000000000000000000"),
            },
          ],
        },
      }),
    }));

    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        handleSubmit: (cb: () => void) => {
          cb();
        },
        formState: {
          errors: {},
        },
        watch: (field: string) => {
          switch (field) {
            case "amount":
              return "0.1";
            case "asset":
              return {
                id: "-1",
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18,
              };
            case "destinationAccount":
              return "0x123";
            default:
              return "";
          }
        },
      }),
    }));

    vi.mock("@src/Extension", () => ({
      default: {
        showPrivateKey: vi.fn().mockResolvedValue("privatekey"),
      },
    }));

    vi.mock("ethers");
  });

  it("should call confirmTx", async () => {
    const ethres = (await import("ethers")) as Record<string, any>;

    ethres.BigNumber.from = (value: string) => new BN(value);
    ethres.ethers.Wallet = vi.fn();
    ethres.ethers.Contract = vi.fn().mockReturnValue({
      estimateGas: vi.fn().mockReturnValue({
        transfer: vi.fn().mockReturnValue(new BN("500000")),
      }),
    });

    const { getByText } = renderComponent();

    const button = getByText(en.send.continue) as HTMLButtonElement;

    await waitFor(() => {
      expect(button.disabled).toEqual(false);
    });

    act(() => {
      fireEvent.click(button);
    });
    expect(confirmTx).toHaveBeenCalled();
  });
});
