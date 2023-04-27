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

  private static set isUnlocked(isUnlocked: boolean) {
    Auth.getInstance().isUnlocked = isUnlocked;
  }

  static get password() {
    return Auth.getInstance().password;
  }

  private static set password(password: string | undefined) {
    Auth.getInstance().password = password;
  }

  static async isSessionActive(): Promise<boolean> {
    if (!Auth.isUnlocked) {
      await Auth.loadFromCache();
    }
    return Auth.isUnlocked;
  }

  static isAuthorized() {
    return Auth.password !== undefined;
  }

  private static async cacheSession() {
    try {
      if (!Auth.isAuthorized()) {
        Auth.signOut();
      }
      await CacheAuth.unlock();
    } catch (error) {
      CacheAuth.clear();
      throw new Error("failed_to_cache_password");
    }
  }

  static async loadFromCache() {
    try {
      await CacheAuth.get<CacheAuth>();
      const { isUnlocked } = CacheAuth.getInstance();
      const hasExpired = await CacheAuth.hasExpired();
      if (hasExpired) {
        Auth.signOut();
        return;
      }
      Auth.isUnlocked = isUnlocked;
    } catch (error) {
      CacheAuth.clear();
      console.error(error);
      throw new Error("failed_to_load_from_cache");
    }
  }

  async decryptVault(vault: string) {
    if (!Auth.isAuthorized()) throw new Error("login_required");
    return passworder.decrypt(this.password as string, vault);
  }

  async encryptVault(vault: Vault) {
    if (!Auth.isAuthorized()) throw new Error("login_required");
    return passworder.encrypt(this.password as string, vault);
  }

  private async validatePassword(password: string) {
    const vault = await Vault.getEncryptedVault();
    if (!vault) throw new Error("vault_not_found");
    const decryptedVault = (await passworder.decrypt(password, vault)) as Vault;
    if (Vault.isInvalid(decryptedVault)) {
      throw new Error("invalid_credentials");
    }
  }

  static async signIn(password: string) {
    const auth = Auth.getInstance();
    try {
      await auth.validatePassword(password);
      auth.setAuth(password);
    } catch (error) {
      Auth.signOut();
      throw error;
    }
  }

  async setAuth(password: string) {
    this.password = password;
    this.isUnlocked = true;
    await Auth.cacheSession();
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

  static async restorePassword(
    backup: string,
    password: string,
    recoveryPhrase: string
  ) {
    const decryptedBackup = await Auth.decryptBackup(backup, recoveryPhrase);
    if (!decryptedBackup) throw new Error("invalid_recovery_phrase");
    Auth.isUnlocked = true;
    Auth.password = decryptedBackup as string;
    const vault = await Vault.getInstance();
    Auth.password = password;
    await Vault.set(vault);
  }
}
