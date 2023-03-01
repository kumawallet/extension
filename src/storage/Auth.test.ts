import Auth from "./Auth";
import { vi } from "vitest";
import Vault from "./entities/Vault";

const DECRYPTED = "decrypted";
const ENCRYPTED = "encrypted";

describe("Auth", () => {
  beforeAll(() => {
    vi.mock("./entities/Vault", () => ({
      default: {},
    }));
    vi.mock("./entities/CacheAuth", () => ({
      default: {},
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
    Auth.password = undefined;
    Auth.isUnlocked = false;
  });

  it("should instance", () => {
    const auth = Auth.getInstance();
    expect(auth).toHaveProperty("decryptVault");
  });

  it("should return isUnlocked", () => {
    Auth.isUnlocked = true;
    expect(Auth.isUnlocked).toBe(true);
  });

  it("should return password", () => {
    const password = "12345";
    Auth.password = password;
    expect(Auth.password).toBe(password);
  });

  it("should return login required", () => {
    try {
      Auth.validate();
      throw new Error("bad test");
    } catch (error) {
      expect(String(error)).toEqual("Error: login_required");
    }
  });

  describe("loadAuthFromCache", () => {
    it("should set password and isUnlocked from cache", async () => {
      const mockCache = {
        password: "12345",
        isUnlocked: true,
      };

      const cacheAuth = await import("./entities/CacheAuth");
      cacheAuth.default.getInstance = vi
        .fn()
        .mockImplementation(() => mockCache);
      cacheAuth.default.hasExpired = vi.fn().mockImplementation(() => false);

      await Auth.loadAuthFromCache("123");
      expect(Auth.password).toEqual(DECRYPTED);
      expect(Auth.isUnlocked).toBe(true);
    });

    it("should signOut", async () => {
      const mockCache = {
        password: "",
        isUnlocked: false,
      };

      const cacheAuth = await import("./entities/CacheAuth");
      cacheAuth.default.getInstance = vi
        .fn()
        .mockImplementation(() => mockCache);
      cacheAuth.default.hasExpired = vi.fn().mockImplementation(() => true);

      const result = await Auth.loadAuthFromCache("123");
      expect(result).toEqual(undefined);
    });
  });

  it("decryptVault", async () => {
    Auth.password = "12345";
    Auth.isUnlocked = true;

    const auth = Auth.getInstance();

    const decryped = await auth.decryptVault("{vault}");
    expect(decryped).toEqual(DECRYPTED);
  });

  it("encryptVault", async () => {
    Auth.password = "12345";
    Auth.isUnlocked = true;

    const auth = Auth.getInstance();

    const encrypted = await auth.encryptVault({} as Vault);
    expect(encrypted).toEqual(ENCRYPTED);
  });

  it("signUp", () => {
    const auth = Auth.getInstance();
    auth.signUp("12345");
    expect(Auth.password).toBe("12345");
    expect(Auth.isUnlocked).toBe(true);
  });

  describe("signIn", () => {
    afterAll(async () => {
      const passworder = await import("@metamask/browser-passworder");
      passworder.default.decrypt = vi.fn().mockReturnValue(DECRYPTED);
    });
    it("should signIn", async () => {
      const auth = Auth.getInstance();
      await auth.signIn("12345", "{vault}");
      expect(Auth.password).toEqual("12345");
      expect(Auth.isUnlocked).toBe(true);
    });

    it("should throw decrypt error", async () => {
      const passworder = await import("@metamask/browser-passworder");
      passworder.default.decrypt = vi.fn().mockReturnValue(null);

      try {
        const auth = Auth.getInstance();
        await auth.signIn("12345", "{vault}");
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: invalid_credentials");
      }
    });
  });

  it("should sign out", async () => {
    const auth = Auth.getInstance();
    await auth.signIn("12345", "{vault}");
    auth.signOut();
    expect(Auth.password).toBe(undefined);
    expect(Auth.isUnlocked).toBe(false);
  });

  describe("encryptBackup", () => {
    it("should return encrypted backup", async () => {
      const auth = Auth.getInstance();
      await auth.signIn("12345", "{vault}");

      const encryped = await auth.encryptBackup("1 2 3 4 5");
      expect(encryped).toEqual("encrypted");
    });

    it("should return error", async () => {
      const auth = Auth.getInstance();
      try {
        await auth.encryptBackup("1 2 3 4 5");
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
      const decrypted = await Auth.decryptBackup("{backup}", "1 2 3 4 5");
      expect(decrypted).toEqual(DECRYPTED);
    });

    it("should return error", async () => {
      const passworder = await import("@metamask/browser-passworder");
      passworder.default.decrypt = vi.fn().mockImplementation(() => {
        throw new Error("failed to decrypt");
      });
      try {
        await Auth.decryptBackup("{backup}", "1 2 3 4 5");
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_restore_backup");
      }
    });
  });

  it("should encrypt salt", async () => {
    const result = await Auth.generateSaltedHash("salt", "12345");
    expect(result).toEqual(ENCRYPTED);
  });
});
