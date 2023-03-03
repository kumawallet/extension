import { vi } from "vitest";
import Account from "./Account";
import SelectedAccount from "./SelectedAccount";
import { selectedEVMAccountMock } from "../../tests/mocks/account-mocks";

describe("SelectedAccount", () => {
  beforeAll(() => {
    vi.mock("./Accounts", () => ({
      default: {
        get: () => ({
          first: () => selectedEVMAccountMock,
        }),
      },
    }));
    vi.mock("./Account", () => ({
      default: {},
    }));
    vi.mock("./CacheAuth", () => ({
      default: {},
    }));
    vi.mock("./Vault", () => ({
      default: {},
    }));
    vi.mock("./BackUp", () => ({
      default: {},
    }));
    vi.mock("./Network", () => ({
      default: {},
    }));
    vi.mock("./settings/Settings", () => ({
      default: {},
    }));
    vi.mock("./registry/Registry", () => ({
      default: {},
    }));
    vi.mock("./activity/Activity", () => ({
      default: {},
    }));
    vi.mock("./Chains", () => ({
      default: {},
    }));
  });

  it("should instance", () => {
    const selectedAccount = new SelectedAccount();

    expect(selectedAccount).toMatchObject({
      key: "EVM-0x000000000",
      value: {},
      type: "EVM",
    });
  });

  it("fromAccount", () => {
    const account = {
      key: "EVM-0x000000000",
      value: {},
      type: "EVM",
    };

    const selectedAccount = new SelectedAccount();
    selectedAccount.fromAccount(account as Account);
    expect(selectedAccount).toMatchObject(account);
  });

  it("getDefaultValue", async () => {
    vi.spyOn(SelectedAccount, "set").mockImplementation(async () => {
      console.log;
    });

    const result = await SelectedAccount.getDefaultValue();

    expect(result).toMatchObject(selectedEVMAccountMock);
  });
});
