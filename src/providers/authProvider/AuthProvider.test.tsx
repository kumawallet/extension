import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AuthProvider, useAuthContext, reducer } from "./AuthProvider";
import { vi } from "vitest";
import { FC, useState } from "react";
import { AccountFormType } from "@src/pages";
import { AccountType } from "@src/accounts/types";

vi.mock("@src/Extension");

interface ResponseState {
  create: null | boolean;
  derive: null | boolean;
  import: null | boolean;
  restore: null | boolean;
}

interface TestComponentProps {
  createdAccount: AccountFormType;
}

const testIds = {
  createBtn: "create-button",
  deriveBtn: "derive-button",
  importBtn: "import-button",
  restoreBtn: "restore-button",
  createResponse: "create-response",
  deriveResponse: "derive-response",
  importResonse: "import-response",
  restoreResponse: "restore-response",
};

const TestComponent: FC<TestComponentProps> = ({ createdAccount }) => {
  const { createAccount, deriveAccount, importAccount, restorePassword } =
    useAuthContext();

  const [responses, setresponses] = useState<ResponseState>({
    create: null,
    derive: null,
    import: null,
    restore: null,
  });

  const _create = async () => {
    const _res = await createAccount(createdAccount);
    setresponses((state) => ({ ...state, create: _res }));
  };

  const _derive = async () => {
    const _res = await deriveAccount(createdAccount);
    setresponses((state) => ({ ...state, derive: _res }));
  };

  const _import = async () => {
    const _res = await importAccount(createdAccount);
    setresponses((state) => ({ ...state, import: _res }));
  };

  const _restore = async () => {
    const _res = await restorePassword(createdAccount);
    setresponses((state) => ({ ...state, restore: _res }));
  };

  return (
    <>
      <button data-testid={testIds.createBtn} onClick={_create} />
      <button data-testid={testIds.deriveBtn} onClick={_derive} />
      <button data-testid={testIds.importBtn} onClick={_import} />
      <button data-testid={testIds.restoreBtn} onClick={_restore} />
      <p data-testid={testIds.createResponse}>{String(responses.create)}</p>
      <p data-testid={testIds.deriveResponse}>{String(responses.derive)}</p>
      <p data-testid={testIds.importResonse}>{String(responses.import)}</p>
      <p data-testid={testIds.restoreResponse}>{String(responses.restore)}</p>
    </>
  );
};

const mockAccountForm: AccountFormType = {
  name: "mock-test",
  privateKeyOrSeed: "0x123",
  password: "123",
  accountType: "EVM" as AccountType,
  isSignUp: true,
  seed: "123",
};

const renderComponent = (accountForm: AccountFormType) => {
  return render(
    <AuthProvider>
      <TestComponent createdAccount={accountForm} />
    </AuthProvider>
  );
};

describe("AuthProvider", () => {
  beforeAll(() => {
    const Extension: any = import("@src/Extension");
    Extension.default = {
      createAccounts: vi.fn().mockResolvedValue(true),
      isUnlocked: vi.fn().mockResolvedValue(true),
      importAccount: vi.fn().mockResolvedValue(true),
      restorePassword: vi.fn().mockResolvedValue(true),
    };
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("reducer", () => {
    const initState = {
      isInit: true,
    };

    const response = reducer(initState, { type: "init", payload: undefined });
    expect(response).toEqual(initState);
  });

  describe("createAccount", () => {
    it("should return true", async () => {
      renderComponent(mockAccountForm);

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.createBtn));
      });
      waitFor(() =>
        expect(screen.getByTestId(testIds.createResponse).innerHTML).toEqual(
          "true"
        )
      );
    });

    it("should return seed_required error", async () => {
      renderComponent({ ...mockAccountForm, seed: "" });

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.createBtn));
      });
      waitFor(() =>
        expect(screen.getByTestId(testIds.createResponse).innerHTML).toEqual(
          "false"
        )
      );
    });
  });

  describe("importAccount", () => {
    it("should return true", async () => {
      renderComponent(mockAccountForm);

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.importBtn));
      });

      waitFor(() =>
        expect(screen.getByTestId(testIds.importResonse).innerHTML).toEqual(
          "true"
        )
      );
    });

    it("should return password_required error", async () => {
      renderComponent({ ...mockAccountForm, password: "" });

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.importBtn));
      });

      waitFor(() =>
        expect(screen.getByTestId(testIds.importResonse).innerHTML).toEqual(
          "false"
        )
      );
    });

    it("should return private_key_or_seed_required error", async () => {
      renderComponent({ ...mockAccountForm, privateKeyOrSeed: "" });

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.importBtn));
      });

      waitFor(() =>
        expect(screen.getByTestId(testIds.importResonse).innerHTML).toEqual(
          "false"
        )
      );
    });

    it("should return account_type_required error", async () => {
      renderComponent({ ...mockAccountForm, accountType: undefined });

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.importBtn));
      });

      waitFor(() =>
        expect(screen.getByTestId(testIds.importResonse).innerHTML).toEqual(
          "false"
        )
      );
    });
  });

  describe("deriveAccount", () => {
    it("should return true", async () => {
      renderComponent(mockAccountForm);

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.deriveBtn));
      });

      waitFor(() =>
        expect(screen.getByTestId(testIds.deriveResponse).innerHTML).toEqual(
          "true"
        )
      );
    });

    it("should return account_type_required error", async () => {
      renderComponent({ ...mockAccountForm, accountType: undefined });

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.deriveBtn));
      });

      waitFor(() =>
        expect(screen.getByTestId(testIds.deriveResponse).innerHTML).toEqual(
          "false"
        )
      );
    });
  });

  describe("restoreAccount", () => {
    it("should return true", async () => {
      renderComponent(mockAccountForm);

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.restoreBtn));
      });

      waitFor(() =>
        expect(screen.getByTestId(testIds.restoreResponse).innerHTML).toEqual(
          "true"
        )
      );
    });

    it("should return recovery_phrase_required error", async () => {
      renderComponent({ ...mockAccountForm, privateKeyOrSeed: undefined });

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.restoreBtn));
      });

      waitFor(() =>
        expect(screen.getByTestId(testIds.restoreResponse).innerHTML).toEqual(
          "false"
        )
      );
    });

    it("should return password_required error", async () => {
      renderComponent({ ...mockAccountForm, password: undefined });

      act(() => {
        fireEvent.click(screen.getByTestId(testIds.restoreBtn));
      });

      waitFor(() =>
        expect(screen.getByTestId(testIds.restoreResponse).innerHTML).toEqual(
          "false"
        )
      );
    });
  });
});
