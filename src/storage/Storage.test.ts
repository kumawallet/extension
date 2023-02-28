import Storage from "./Storage";
import { vi } from "vitest";

const initChainsMock = vi.fn().mockImplementation(() => null);
const clearMock = vi.fn().mockImplementation(() => null);

describe("Storage", () => {
  beforeAll(() => {
    global.navigator = {
      ...global.navigator,
      userAgent: {
        match: () => true,
      } as any,
    };

    global.chrome = {
      ...global.chrome,
      storage: {
        local: {} as any,
      } as any,
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

    vi.mock("./entities/Chains", () => ({
      default: {
        init: () => initChainsMock(),
      },
    }));
  });

  it("should instance", () => {
    const storageInstance = Storage.getInstance();
    const browser = storageInstance.browser;
    const storage = storageInstance.storage;
    expect(browser).toHaveProperty("storage");
    expect(storage).toHaveProperty("clear");
  });

  it("should return salt", async () => {
    global.navigator = {
      appName: "1",
      platform: "2",
      userAgent: "3",
      language: "4",
    } as any;

    const salt = await Storage.getInstance().getSalt();
    expect(salt).toEqual("1-2-3-4-7");
  });

  describe("init", () => {
    it("should init", async () => {
      await Storage.getInstance().init();
      expect(initChainsMock).toHaveBeenCalled();
    });

    it("should throw already_signed_up error", async () => {
      const Vault = await import("./entities/Vault");
      Vault.default.alreadySignedUp = vi.fn().mockResolvedValue(() => false);

      try {
        await Storage.getInstance().init();
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
