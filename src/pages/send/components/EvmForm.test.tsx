import { selectedEVMChainMock } from "@src/tests/mocks/chain-mocks";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
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
            getGasPrice: vi.fn().mockReturnValue(BigNumber.from("1000000000")),
            estimateGas: vi.fn().mockReturnValue(BigNumber.from("21000")),
            getFeeData: vi.fn().mockReturnValue({
              maxFeePerGas: BigNumber.from("1000000000"),
              maxPriorityFeePerGas: BigNumber.from("1000000000"),
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
              balance: BigNumber.from("1000000000000000000"),
            },
          ],
        },
      }),
      useAccountContext: () => ({
        state: {
          selectedAccount: {
            value: {
              address: "0xa0a58b72969DF1904Bf2315f2D041AD639737429",
            }
          },
        }
      }),
      useThemeContext: () => ({
        color: "red",
      }),
    }));

    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        getValues: (value: string) => {
          if (value === "isXcm") {
            return false;
          }

          if (value === "to") {
            return {
              address: "0xa0a58b72969DF1904Bf2315f2D041AD639737429",
            };
          }

          return null;
        },
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
              return "0xa0a58b72969DF1904Bf2315f2D041AD639737429";
            default:
              return "";
          }
        },
      }),
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        showKey: vi.fn().mockResolvedValue("privatekey"),
        isAuthorized: vi.fn().mockReturnValue(true),
      }
    }))

    vi.mock("ethers", async () => {
      const ethers = (await vi.importActual("ethers")) as any;
      return {
        ...ethers,
        ethers: {
          ...ethers.ethers,
          Wallet: class Wallet { },
          Contract: class Contract {
            estimateGas = {
              transfer: vi.fn().mockReturnValue(
                Promise.resolve(BigNumber.from("21000"))
              ),
            };
          },
        },
      };
    });

    vi.mock("react-router-dom", () => ({
      useNavigate: () => () => vi.fn(),
    }));
  });

  it("should call confirmTx with native asset", async () => {
    const { getByText } = renderComponent();

    const button = getByText(en.send.continue) as HTMLButtonElement;

    await waitFor(() => {
      expect(button.disabled).toEqual(false);
    }, {
      timeout: 10000
    });

    act(() => {
      fireEvent.click(button);
    });
    expect(confirmTx).toHaveBeenCalled();
  });

  it("should call confirmTx with erc20 asset", async () => {
    const rhf = (await import("react-hook-form")) as any;
    rhf.useFormContext = () => ({
      getValues: (value: string) => {
        if (value === "isXcm") {
          return false;
        }

        if (value === "to") {
          return {
            address: "0xa0a58b72969DF1904Bf2315f2D041AD639737429",
          };
        }

        return null;
      },
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
              id: "1",
              name: "Tether USD",
              symbol: "USDT",
              decimals: 18,
              balance: BigNumber.from("1000000000000000000"),
            };
          case "destinationAccount":
            return "0xa0a58b72969DF1904Bf2315f2D041AD639737429";
          default:
            return "";
        }
      },
    });

    const { getByText } = renderComponent();

    const button = getByText(en.send.continue) as HTMLButtonElement;

    await waitFor(() => {
      expect(button.disabled).toEqual(false);
    }, {
      timeout: 10000
    });

    act(() => {
      fireEvent.click(button);
    });
    expect(confirmTx).toHaveBeenCalled();
  });

  // it("should return error calculating gas fee", async () => {

  // })
});
