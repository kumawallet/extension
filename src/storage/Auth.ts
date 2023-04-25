import passworder from "@metamask/browser-passworder";
import CacheAuth from "./entities/CacheAuth";
import Vault from "./entities/Vault";

export default class Auth {
  private static instance: Auth;

  private constructor(
    private isUnlocked: boolean,
    private password: string | undefined
  ) {}

  public static getInstance() {
    if (!Auth.instance) {
      Auth.instance = new Auth(false, undefined);
    }
    return Auth.instance;
  }

  static get isUnlocked() {
    return Auth.getInstance().isUnlocked;
  }

  static set isUnlocked(isUnlocked: boolean) {
    Auth.getInstance().isUnlocked = isUnlocked;
  }

  static get password() {
    return Auth.getInstance().password;
  }

  static set password(password: string | undefined) {
    Auth.getInstance().password = password;
  }

  static isAuthorized() {
    return Auth.isUnlocked && !Auth.password;
  }

  static async cachePassword() {
    try {
      if (!Auth.password) {
        return;
      }
      const salt = passworder.generateSalt();
      const encrypted = await passworder.encrypt(salt, Auth.password);
      const cache = CacheAuth.getInstance();
      cache.save(encrypted);
      await CacheAuth.set<CacheAuth>(cache);
    } catch (error) {
      CacheAuth.clear();
      throw new Error("failed_to_cache_password");
    }
  }

  static async loadFromCache() {
    try {
      await CacheAuth.get<CacheAuth>();
      const { password, isUnlocked } = CacheAuth.getInstance();
      const hasExpired = await CacheAuth.hasExpired();
      if (hasExpired || !password) {
        Auth.signOut();
        return;
      }
      const salt = passworder.generateSalt();
      const decrypted = await passworder.decrypt(salt, password);
      Auth.password = decrypted as string;
      Auth.isUnlocked = isUnlocked;
    } catch (error) {
      CacheAuth.clear();
    }
  }

  async decryptVault(vault: string) {
    if (!Auth.isAuthorized) throw new Error("login_required");
    return passworder.decrypt(this.password as string, vault);
  }

  async encryptVault(vault: Vault) {
    if (!Auth.isAuthorized) throw new Error("login_required");
    return passworder.encrypt(this.password as string, vault);
  }

  async validatePassword(password: string, vault: string) {
    const decryptedVault = (await passworder.decrypt(password, vault)) as Vault;
    if (Vault.isInvalid(decryptedVault)) {
      throw new Error("invalid_credentials");
    }
  }

  static async signIn(password: string, vault: string) {
    const auth = Auth.getInstance();
    try {
      await auth.validatePassword(password, vault);
      auth.setAuth(password);
    } catch (error) {
      Auth.signOut();
      throw error;
    }
  }

  async setAuth(password: string) {
    this.password = password;
    this.isUnlocked = true;
    Auth.cachePassword();
  }

  static signOut() {
    const auth = Auth.getInstance();
    auth.isUnlocked = false;
    auth.password = undefined;
    CacheAuth.clear();
  }

  async encryptBackup(recoveryPhrase: string) {
    try {
      if (!this.password) throw new Error("login_required");
      return passworder.encrypt(recoveryPhrase, this.password);
    } catch (error) {
      throw new Error("failed_to_save_backup");
    }
  }

  static async decryptBackup(backup: string, recoveryPhrase: string) {
    try {
      return passworder.decrypt(recoveryPhrase, backup);
    } catch (error) {
      throw new Error("failed_to_restore_backup");
    }
  }
}
