import Auth from "./Auth";
import { vi } from "vitest";
import Vault from "./entities/Vault";

const DECRYPTED = "decrypted";
const ENCRYPTED = "encrypted";

const fakePassword = "Test.123";
const fakeBackup = "fakeBackup";

describe("Auth", () => {
  beforeAll(() => {
    vi.mock("");

    vi.mock("./entities/Vault", () => {
      const ENCRYPTED = "encrypted";

      return {
        default: {
          getEncryptedVault: vi.fn().mockResolvedValue(ENCRYPTED),
          isInvalid: vi.fn().mockReturnValue(false),
          getInstance: vi.fn(),
          set: vi.fn(),
        },
      };
    });
    vi.mock("./entities/CacheAuth", () => ({
      default: {
        clear: vi.fn(),
        get: vi.fn(),
        getInstance: vi.fn().mockReturnValue({
          isUnlocked: true,
        }),
        hasExpired: vi.fn().mockReturnValue(false),
        unlock: vi.fn(),
      },
    }));
    vi.mock("@metamask/browser-passworder", () => {
      const DECRYPTED = "decrypted";
      const ENCRYPTED = "encrypted";
      return {
        default: {
          decrypt: vi.fn().mockResolvedValue(DECRYPTED),
          encrypt: vi.fn().mockResolvedValue(ENCRYPTED),
        },
      };
    });
  });

  afterEach(() => {
    Auth.signOut();
  });

  it("should instance", () => {
    const auth = Auth.getInstance();
    expect(auth).toHaveProperty("decryptVault");
  });

  it("should return isUnlocked", () => {
    expect(Auth.isUnlocked).toBe(false);
  });

  it("should return password", () => {
    expect(Auth.password).toBe(undefined);
  });

  it("should return isSessionActive", async () => {
    const mockCache = {
      isUnlocked: true,
      timeout: new Date().getTime() + 1000 * 60 * 60 * 24,
    };

    const cacheAuth = await import("./entities/CacheAuth");
    cacheAuth.default.getInstance = vi.fn().mockImplementation(() => mockCache);
    cacheAuth.default.hasExpired = vi.fn().mockImplementation(() => true);
    await Auth.isSessionActive();
    expect(Auth.isUnlocked).toBe(false);
  });

  it("should return isSessionActive", async () => {
    await Auth.isSessionActive();
    expect(Auth.isUnlocked).toBe(false);
  });

  it("should return false if there is no password", () => {
    expect(Auth.isAuthorized()).toBe(false);
  });

  it("should return true if there is a password", () => {
    Auth.getInstance().setAuth(fakePassword);
    expect(Auth.isAuthorized()).toBe(true);
  });

  describe("loadAuthFromCache", () => {
    it("should set isUnlocked from cache", async () => {
      const mockCache = {
        isUnlocked: true,
        timeout: new Date().getTime() + 1000 * 60 * 60 * 24,
      };

      const cacheAuth = await import("./entities/CacheAuth");
      cacheAuth.default.getInstance = vi
        .fn()
        .mockImplementation(() => mockCache);
      cacheAuth.default.hasExpired = vi.fn().mockImplementation(() => false);

      await Auth.loadFromCache();
      expect(Auth.isUnlocked).toBe(true);
    });

    it("should signOut", async () => {
      const mockCache = {
        isUnlocked: true,
        timeout: new Date().getTime() - 1000 * 60 * 60 * 24,
      };

      const cacheAuth = await import("./entities/CacheAuth");
      cacheAuth.default.getInstance = vi
        .fn()
        .mockImplementation(() => mockCache);
      cacheAuth.default.hasExpired = vi.fn().mockImplementation(() => true);
      cacheAuth.default.set = vi.fn();

      await Auth.loadFromCache();
      expect(Auth.isUnlocked).toBe(false);
      expect(Auth.password).toBe(undefined);
    });
  });

  it("decryptVault", async () => {
    const cacheAuth = await import("./entities/CacheAuth");
    cacheAuth.default.unlock = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    Auth.getInstance().setAuth(fakePassword);

    const auth = Auth.getInstance();

    const decryped = await auth.decryptVault("{vault}");
    expect(decryped).toEqual(DECRYPTED);
  });

  it("encryptVault", async () => {
    const cacheAuth = await import("./entities/CacheAuth");
    cacheAuth.default.unlock = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    Auth.getInstance().setAuth(fakePassword);

    const auth = Auth.getInstance();

    const encrypted = await auth.encryptVault({} as Vault);
    expect(encrypted).toEqual(ENCRYPTED);
  });

  describe("signIn", () => {
    it("should signIn", async () => {
      const passworder = await import("@metamask/browser-passworder");
      passworder.default.decrypt = vi.fn().mockReturnValue(DECRYPTED);
      await Auth.signIn(fakePassword);
      expect(Auth.password).toEqual(fakePassword);
      expect(Auth.isUnlocked).toBe(true);
    });

    it("should throw decrypt error", async () => {
      const passworder = await import("@metamask/browser-passworder");
      passworder.default.decrypt = vi.fn().mockReturnValue(null);
      const vault = await import("./entities/Vault");
      vault.default.isInvalid = vi.fn().mockReturnValue(true);
      try {
        await Auth.signIn(fakePassword);
        throw new Error("test failed");
      } catch (error) {
        expect(String(error)).toEqual("Error: invalid_credentials");
      }
    });
  });

  describe("encryptBackup", () => {
    it("should return encrypted backup", async () => {
      const vault = await import("./entities/Vault");
      vault.default.isInvalid = vi.fn().mockReturnValue(false);

      await Auth.signIn(fakePassword);

      const encryped = await Auth.getInstance().encryptBackup(fakeBackup);
      expect(encryped).toEqual(ENCRYPTED);
    });

    it("should return error", async () => {
      try {
        await Auth.getInstance().encryptBackup(fakeBackup);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_save_backup");
      }
    });
  });

  describe("decryptBackup", () => {
    afterAll(async () => {
      const passworder = await import("@metamask/browser-passworder");
      passworder.default.decrypt = vi.fn().mockReturnValue(DECRYPTED);
    });

    it("should return encrypted backup", async () => {
      const passworder = await import("@metamask/browser-passworder");
      passworder.default.decrypt = vi.fn().mockReturnValue(DECRYPTED);

      const decrypted = await Auth.decryptBackup("{backup}", fakeBackup);
      expect(decrypted).toEqual(DECRYPTED);
    });

    it("should return error", async () => {
      const passworder = await import("@metamask/browser-passworder");
      passworder.default.decrypt = vi.fn().mockImplementation(() => {
        throw new Error("failed to decrypt");
      });
      try {
        await Auth.decryptBackup("{backup}", fakeBackup);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_restore_backup");
      }
    });
  });

  describe("restorePassword", () => {
    it("should change password", async () => {
      const oldPassword = "oldPassword";

      Auth.getInstance().setAuth(oldPassword);

      const passworder = await import("@metamask/browser-passworder");
      passworder.default.decrypt = vi.fn().mockReturnValue({
        password: oldPassword,
      });

      const password = await Auth.restorePassword(oldPassword, fakePassword);
      expect(password).toEqual(undefined);
    });

    // it("should throw error", async () => {
    //   const passworder = await import("@metamask/browser-passworder");
    //   passworder.default.decrypt = vi.fn().mockReturnValue(null);

    //   try {
    //     await Auth.restorePassword("{backup}", fakeBackup, "recoveryPhrase");
    //     throw new Error("bad test");
    //   } catch (error) {
    //     expect(String(error)).toEqual("Error: invalid_recovery_phrase");
    //   }
    // });
  });
});
