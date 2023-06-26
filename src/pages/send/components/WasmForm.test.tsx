import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { WasmForm } from "./WasmForm";
import { BN } from "bn.js";
import { selectedWASMChainMock } from "@src/tests/mocks/chain-mocks";
import { act } from "react-dom/test-utils";
import { en } from "@src/i18n";
import { selectedWASMAccountMock } from "@src/tests/mocks/account-mocks";

const confirmTx = vi.fn();

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <WasmForm confirmTx={() => confirmTx()} />
    </I18nextProvider>
  );
};

describe("WasmForm", () => {
  beforeAll(() => {
    vi.mock("./CommonFormFields", () => ({
      CommonFormFields: () => <div>CommonFormFields</div>,
    }));

    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: {
          api: {
            query: {
              polkadotXcm: {
                palletVersion: () => ({
                  toString: () => "0",
                }),
              },
            },
            registry: {
              createType: () => new BN("1000000"),
            },
            tx: {
              balances: {
                transfer: () => ({
                  paymentInfo: {
                    partialFee: new BN("1000000"),
                  },
                  signAsync: () => "",
                }),
              },
              assets: {
                create: () => ({
                  paymentInfo: {
                    partialFee: new BN("1000000"),
                  },
                }),
                transfer: () => ({
                  paymentInfo: () => ({
                    partialFee: new BN("1000000"),
                  }),
                  signAsync: () => "",
                }),
              },
              xcmPallet: {
                limitedReserveTransferAssets: () => ({
                  paymentInfo: () => ({
                    partialFee: new BN("1000000"),
                  }),
                  signAsync: () => "",
                }),
              },
            },
          },
          selectedChain: selectedWASMChainMock,
        },
      }),
      useAssetContext: () => ({
        state: {
          assets: [
            {
              id: "-1",
              name: "DOT",
              symbol: "DOT",
              decimals: 18,
              balance: new BN("1000000000000000000"),
            },
            {
              id: "10",
              name: "DOT",
              symbol: "DOT",
              decimals: 18,
              balance: new BN("1000000000000000000"),
            },
          ],
        },
      }),
      useAccountContext: () => ({
        state: {
          selectedAccount: selectedWASMAccountMock,
        },
      }),
      useThemeContext: () => ({
        color: "red",
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
                name: "DOT",
                symbol: "DOT",
                decimals: 18,
                balance: new BN("1000000000000000000"),
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
        showKey: vi.fn().mockResolvedValue("privatekey"),
        isAuthorized: vi.fn().mockReturnValue(true),
      },
    }));

    vi.mock("@polkadot/api-contract", () => {
      class ContractPromise {
        constructor() {
          return {
            query: {
              transfer: () => ({
                gasRequired: {
                  toJSON: () => ({
                    proofSize: new BN("100"),
                    refTime: new BN("100"),
                  }),
                },
              }),
            },
            tx: {
              transfer: () => ({
                paymentInfo: {
                  partialFee: new BN("100000000"),
                },
                signAsync: () => "",
              }),
            },
          };
        }
      }

      return {
        ContractPromise,
      };
    });

    // mock keyring
    vi.mock("@polkadot/keyring");

    vi.mock("react-router-dom", () => ({
      useNavigate: () => () => vi.fn(),
    }));
  });

  it("should call confirmTx", async () => {
    const rhf = (await import("react-hook-form")) as any;
    rhf.useFormContext = () => ({
      handleSubmit: (cb: () => void) => {
        cb();
      },
      formState: {
        errors: {},
      },
      getValues: (value: string) => {
        switch (value) {
          case "isXcm":
            return false;

          default:
            return "";
        }
      },
      watch: (field: string) => {
        switch (field) {
          case "amount":
            return "0.00005";
          case "asset":
            return {
              id: "10",
              address: "0x123",
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
              balance: new BN("1000000000000000000"),
            };
          case "destinationAccount":
            return "0x123";
          default:
            return "";
        }
      },
    });

    const pKeyring = (await import("@polkadot/keyring")) as any;
    pKeyring.Keyring = class {
      constructor() {
        return {
          addFromMnemonic: () => ({
            address: "0x123",
          }),
        };
      }
    };

    const { getByText } = renderComponent();
    const button = getByText(en.send.continue) as HTMLButtonElement;
    await waitFor(
      () => {
        expect(button.disabled).toEqual(false);
      },
      {
        timeout: 10000,
      }
    );
    act(() => {
      fireEvent.click(button);
    });
    await waitFor(() => {
      expect(confirmTx).toHaveBeenCalled();
    });
  });

  it("should call confirmTx with created asset", async () => {
    const rhf = (await import("react-hook-form")) as any;
    rhf.useFormContext = () => ({
      handleSubmit: (cb: () => void) => {
        cb();
      },
      formState: {
        errors: {},
      },
      getValues: (value: string) => {
        switch (value) {
          case "isXcm":
            return false;

          default:
            return "";
        }
      },
      watch: (field: string) => {
        switch (field) {
          case "amount":
            return "0.00005";
          case "asset":
            return {
              id: "10",
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
              balance: "1000000000000000000",
            };
          case "destinationAccount":
            return "0x123";
          default:
            return "";
        }
      },
    });

    const pKeyring = (await import("@polkadot/keyring")) as any;
    pKeyring.Keyring = class {
      constructor() {
        return {
          addFromMnemonic: () => ({
            address: "0x123",
          }),
        };
      }
    };

    const { getByText } = renderComponent();
    const button = getByText(en.send.continue) as HTMLButtonElement;
    await waitFor(
      () => {
        expect(button.disabled).toEqual(false);
      },
      {
        timeout: 10000,
      }
    );
    act(() => {
      fireEvent.click(button);
    });
    await waitFor(() => {
      expect(confirmTx).toHaveBeenCalled();
    });
  });

  it("should call confirmTx with xcm", async () => {
    const rhf = (await import("react-hook-form")) as any;
    rhf.useFormContext = () => ({
      handleSubmit: (cb: () => void) => {
        cb();
      },
      formState: {
        errors: {},
      },
      getValues: (value: string) => {
        switch (value) {
          case "isXcm":
            return true;

          default:
            return "";
        }
      },
      watch: (field: string) => {
        switch (field) {
          case "amount":
            return "0.00005";
          case "asset":
            return {
              id: "1",
              name: "DOT",
              symbol: "DOT",
              decimals: 18,
              balance: "1000000000000000000",
            };
          case "destinationAccount":
            return "0x55423C073C5e5Ce2D30Ec466a6cDEF0803EC32Cc";
          case "to":
            return {
              name: "Moonbeam",
            };
          default:
            return "";
        }
      },
    });

    const pKeyring = (await import("@polkadot/keyring")) as any;
    pKeyring.Keyring = class {
      constructor() {
        return {
          addFromMnemonic: () => ({
            address: "0x123",
          }),
        };
      }
    };

    const { getByText } = renderComponent();
    const button = getByText(en.send.continue) as HTMLButtonElement;
    await waitFor(
      () => {
        expect(button.disabled).toEqual(false);
      },
      {
        timeout: 10000,
      }
    );
    act(() => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(confirmTx).toHaveBeenCalled();
    });
  });
});
