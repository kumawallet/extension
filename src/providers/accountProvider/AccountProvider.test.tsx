import { CHAINS } from "@src/constants/chains";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { AccountProvider, useAccountContext } from "./AccountProvider";
import { selectedWASMAccountMock } from "../../tests/mocks/account-mocks";

const testIds = {
  createAccount: "create-account",
  deriveAccount: "derive-account",
  importAccount: "import-account",
};

const TestComponent = () => {
  const {
    state,
    createAccount,
    deriveAccount,
    getAllAccounts,
    getSelectedAccount,
    importAccount,
    setSelectedAccount,
  } = useAccountContext();

  return (
    <>
      <button
        data-testid={testIds.createAccount}
        onClick={() => createAccount({} as any)}
      />
      <button
        data-testid={testIds.importAccount}
        onClick={() => importAccount({} as any)}
      />
      <button
        data-testid={testIds.deriveAccount}
        onClick={() => deriveAccount({} as any)}
      />
    </>
  );
};

const renderComponent = () => {
  return render(
    <AccountProvider>
      <TestComponent />
    </AccountProvider>
  );
};

const createAccount = vi.fn().mockReturnValue(true);
const deriveAccount = vi.fn().mockReturnValue(true);
const importAccount = vi.fn().mockReturnValue(true);

describe("AccountProvider", () => {
  beforeAll(() => {
    vi.mock("../networkProvider/NetworkProvider.tsx", () => ({
      useNetworkContext: vi.fn().mockReturnValue({
        state: {
          selectedChain: CHAINS[0].chains[1],
        },
        setNewRpc: vi.fn(),
        setSelectNetwork: vi.fn(),
      }),
    }));
    vi.mock("../authProvider/AuthProvider.tsx", () => ({
      useAuthContext: vi.fn().mockReturnValue({
        createAccount: () => createAccount(),
        deriveAccount: () => deriveAccount(),
        importAccount: () => importAccount(),
      }),
    }));
    vi.mock("@src/hooks", () => ({
      useToast: vi.fn().mockReturnValue({
        showErrorToast: vi.fn(),
      }),
    }));
    vi.mock("@src/Extension", () => ({
      default: {
        setSelectedAccount: vi.fn(),
      },
    }));
  });

  it("should create account", async () => {
    renderComponent();

    const btn = await screen.findByTestId(testIds.createAccount);
    await act(() => {
      fireEvent.click(btn);
    });
    expect(createAccount).toHaveBeenCalled();
  });

  it("should import account", async () => {
    renderComponent();

    const btn = await screen.findByTestId(testIds.importAccount);
    await act(() => {
      fireEvent.click(btn);
    });
    expect(importAccount).toHaveBeenCalled();
  });

  it("should derive account", async () => {
    renderComponent();

    const btn = await screen.findByTestId(testIds.deriveAccount);
    await act(() => {
      fireEvent.click(btn);
    });
    expect(deriveAccount).toHaveBeenCalled();
  });
});
