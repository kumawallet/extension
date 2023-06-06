import Storage from "./Storage";
import { vi } from "vitest";

const initChainsMock = vi.fn().mockImplementation(() => null);
const clearMock = vi.fn().mockImplementation(() => null);

const fakePassword = "Asdasd123123!";
const fakeKey = "fakeKey";

describe("Storage", () => {
  beforeAll(() => {
    (global.navigator as unknown) = {
      ...global.navigator,
      userAgent: {
        match: () => true,
      },
    };

    (global.chrome as unknown) = {
      storage: { local: {} },
    };

    global.window.browser = {
      runtime: {
        id: "7",
      },
      storage: {
        local: {
          clear: () => clearMock(),
        },
      },
    };

    vi.mock("./entities/CacheAuth", () => ({
      default: {
        init: vi.fn(),
      },
    }));

    vi.mock("./Auth", () => ({
      default: {
        getInstance: vi.fn().mockImplementation(() => ({
          setAuth: vi.fn(),
        })),
      },
    }));

    vi.mock("./entities/Vault", () => ({
      default: {
        init: vi.fn(),
        alreadySignedUp: vi.fn().mockImplementation(() => false),
      },
    }));

    vi.mock("./entities/BackUp", () => ({
      default: {
        init: vi.fn(),
      },
    }));

    vi.mock("./entities/Network", () => ({
      default: {
        init: vi.fn(),
      },
    }));

    vi.mock("./entities/settings/Settings", () => ({
      default: {
        init: vi.fn(),
      },
    }));

    vi.mock("./entities/Accounts", () => ({
      default: {
        init: vi.fn(),
      },
    }));

    vi.mock("./entities/registry/Registry", () => ({
      default: {
        init: vi.fn(),
      },
    }));

    vi.mock("./entities/activity/Activity", () => ({
      default: {
        init: vi.fn(),
      },
    }));

    vi.mock("../accounts/AccountManager", () => ({
      default: {
        saveBackup: vi.fn(),
      },
    }));

    vi.mock("./entities/Chains", () => ({
      default: {
        init: () => initChainsMock(),
      },
    }));
  });

  it("should instance", () => {
    const storageInstance = Storage.getInstance();
    const storage = storageInstance.storage;
    expect(storage).toHaveProperty("clear");
  });

  describe("init", () => {
    it("should init", async () => {
      await Storage.init(fakePassword, fakeKey);
      expect(initChainsMock).toHaveBeenCalled();
    });

    it("should throw already_signed_up error", async () => {
      const Vault = await import("./entities/Vault");
      Vault.default.alreadySignedUp = vi.fn().mockResolvedValue(() => false);

      try {
        await Storage.init(fakePassword, fakeKey);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: already_signed_up");
      }
    });
  });

  it("reset wallet", async () => {
    await Storage.getInstance().resetWallet();
    expect(clearMock).toHaveBeenCalled();
  });
});
