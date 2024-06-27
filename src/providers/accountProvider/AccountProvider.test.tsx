import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AccountProvider, useAccountContext, reducer } from "./AccountProvider";
import Account from "@src/storage/entities/Account";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { InitialState } from "./types";
import { AccountType } from "@src/accounts/types";
import { SUBSTRATE_CHAINS } from "@src/constants/chainsData";
import { EVM_ACCOUNT_MOCK } from "@src/tests/mocks/account-mocks";

const testIds = {
  createAccount: "create-account",
  deriveAccount: "derive-account",
  importAccount: "import-account",
  getSelectedAccount: "get-selected-account",
  getAllAccounts: "get-all-accounts",
  setSelectedAccount: "set-selected-account",
  updateAccountName: "update-account-name",
};

const TestComponent = () => {
  const {
    createAccount,
    deriveAccount,
    getAllAccounts,
    getSelectedAccount,
    importAccount,
    setSelectedAccount,
    updateAccountName,
  } = useAccountContext();

  return (
    <>
      <button
        data-testid={testIds.setSelectedAccount}
        onClick={() => setSelectedAccount(EVM_ACCOUNT_MOCK as Account)}
      />
      <button
        data-testid={testIds.getAllAccounts}
        onClick={() => getAllAccounts(null)}
      />
      <button
        data-testid={testIds.getSelectedAccount}
        onClick={getSelectedAccount}
      />
      <button
        data-testid={testIds.createAccount}
        onClick={() =>
          createAccount({
            seed: "mock_seed",
          } as {
            seed: string;
          })
        }
      />
      <button
        data-testid={testIds.importAccount}
        onClick={() =>
          importAccount({
            password: "mock_password",
            privateKeyOrSeed: "mock_private_key",
            accountType: AccountType.EVM,
          } as {
            password: string;
            privateKeyOrSeed: string;
            accountType: AccountType;
          })
        }
      />
      <button
        data-testid={testIds.deriveAccount}
        onClick={() =>
          deriveAccount({
            name: "",
            accountType: AccountType.EVM,
            address: "mock_address",
          })
        }
      />
      <button
        data-testid={testIds.updateAccountName}
        onClick={() => updateAccountName("EVM-123", "newName")}
      />
    </>
  );
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    </I18nextProvider>
  );
};

const createAccount = vi.fn().mockReturnValue(true);
const deriveAccount = vi.fn().mockReturnValue(true);
const importAccount = vi.fn().mockReturnValue(true);
const changeAccountName = vi.fn();

const setSelectedAccount = vi.fn();
const getSelectedAccount = vi
  .fn()
  .mockReturnValue(() => EVM_ACCOUNT_MOCK);
const getAllAccounts = vi.fn().mockReturnValue([EVM_ACCOUNT_MOCK]);

describe("AccountProvider", () => {
  beforeAll(() => {
    vi.mock("../networkProvider/NetworkProvider", () => ({
      useNetworkContext: vi.fn(() => ({
        state: {
          selectedChain: SUBSTRATE_CHAINS[0],
        },
      })),
    }));
    vi.mock("@src/hooks", () => ({
      useToast: vi.fn().mockReturnValue({
        showErrorToast: vi.fn(),
      }),
    }));
    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getAllAccounts: () => getAllAccounts(),
        changeAccountName: () => changeAccountName(),
        getSelectedAccount: () => getSelectedAccount(),
        setSelectedAccount: () => setSelectedAccount(),
        getNetwork: () => vi.fn(),
        isSessionActive: () => true,
        importAccount: () => importAccount(),
        deriveAccount: () => deriveAccount(),
        createAccounts: () => createAccount(),
      },
    }));
  });

  describe("reducer", () => {
    it("should set accounts", () => {
      const state = {
        accounts: [],
        isLoadingAccounts: true,
        selectedAccount: {
          address: "0x123",
        },
      } as unknown as InitialState;

      const result = reducer(state, {
        type: "change-selected-address-format",
        payload: {
          address: "0x1234",
        },
      });
      expect(result.selectedAccount?.value!.address).toEqual("0x1234");
    });

    it("should update account name", () => {
      const account = {
        key: "key",
        value: {
          name: "originalName",
        },
      } as unknown as Account;

      const state = {
        accounts: [account],
        isLoadingAccounts: true,
        selectedAccount: account,
      } as unknown as InitialState;

      const result = reducer(state, {
        type: "update-account-name",
        payload: {
          name: "newName",
          accountKey: "key",
        },
      });
      expect(result.accounts[0].value!.name).toEqual("newName");
      expect(result.selectedAccount?.value!.name).toEqual("newName");
    });
  });

  it("should create account", async () => {
    renderComponent();

    const btn = await screen.findByTestId(testIds.createAccount);
    act(() => {
      fireEvent.click(btn);
    });
    await waitFor(() => expect(createAccount).toHaveBeenCalled());
  });

  it("should import account", async () => {
    renderComponent();

    const btn = await screen.findByTestId(testIds.importAccount);
    act(() => {
      fireEvent.click(btn);
    });
    await waitFor(() => expect(importAccount).toHaveBeenCalled());
  });

  it("should derive account", async () => {
    renderComponent();

    const btn = await screen.findByTestId(testIds.deriveAccount);
    act(() => {
      fireEvent.click(btn);
    });
    await waitFor(() => expect(deriveAccount).toHaveBeenCalled());
  });

  it("should call get selected account", async () => {
    const getSelectedAccount = vi.fn().mockReturnValue(EVM_ACCOUNT_MOCK);

    const Default = await import("@src/messageAPI/api");

    Default.messageAPI.getSelectedAccount = getSelectedAccount;

    renderComponent();

    const btn = await screen.findByTestId(testIds.getSelectedAccount);
    act(() => {
      fireEvent.click(btn);
    });
    await waitFor(() => {
      expect(getSelectedAccount).toHaveBeenCalled();
    });
  });

  it("should call get all accounts", async () => {
    renderComponent();

    const btn = await screen.findByTestId(testIds.getAllAccounts);
    act(() => {
      fireEvent.click(btn);
    });
    await waitFor(() => expect(getAllAccounts).toHaveBeenCalled());
  });

  it("should set selected account", async () => {
    renderComponent();

    const btn = screen.getByTestId(testIds.setSelectedAccount);
    act(() => {
      fireEvent.click(btn);
    });
    await waitFor(() => expect(setSelectedAccount).toHaveBeenCalled());
  });

  it("should change account name", async () => {
    renderComponent();
    const btn2 = screen.getByTestId(testIds.updateAccountName);
    act(() => {
      fireEvent.click(btn2);
    });
    await waitFor(() => expect(changeAccountName).toHaveBeenCalled());
  });
});
