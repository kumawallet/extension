import { VAULT } from "./constants";
import AccountManager, { AccountType } from "./handlers/AccountManager";
import EVMHandler from "./handlers/EVMHandler";
import WASMHandler from "./handlers/WASMHandler";
import { Account, AccountKey } from "./storage/entities/Accounts";
import Auth from "./storage/Auth";
import Storage from "./storage/Storage";

export default class Extension {
  #accountType: AccountType;
  #auth: Auth;
  #storage: Storage;

  private static instance: Extension;

  private constructor(accountType: AccountType = AccountType.EVM) {
    this.#accountType = accountType;
    this.#auth = Auth.getInstance();
    this.#storage = Storage.getInstance();
  }

  public static getInstance(accountType: AccountType = AccountType.EVM) {
    if (!Extension.instance) {
      Extension.instance = new Extension(accountType);
    }
    return Extension.instance;
  }

  get accountType(): AccountType {
    return this.#accountType;
  }

  set accountType(accountType: AccountType) {
    this.#accountType = accountType;
  }

  get accountManager(): AccountManager {
    switch (this.#accountType) {
      case AccountType.EVM:
        return new EVMHandler();
      case AccountType.WASM:
        return new WASMHandler();
      default:
        throw new Error("Invalid account type");
    }
  }

  async signUp({ seed, name, password }: any) {
    // Stores password in memory
    await this.#auth.signUp({ password });
    // Initializes the storage
    await this.#storage.init();
    // Caches the password
    await this.#storage.cachePassword();
    // Adds the account to storage
    this.addAccount({ name, seed });
  }

  addAccount({ seed, name }: any) {
    this.accountManager.addAccount(seed, name);
  }

  removeAccount(key: AccountKey) {
    this.accountManager.forget(key);
  }

  changeAccountName({ key, newName }: any) {
    this.accountManager.changeName(key, newName);
  }

  async signIn(password: string) {
    try {
      // Get encrypted vault from storage
      const { vault } = await this.#storage.getStorage().get(VAULT);
      // Decrypt vault with password
      await this.#auth.signIn(password, vault);
      // Cache password
      await this.#storage.cachePassword();
      return true;
    } catch (error) {
      console.log("error", error);
      return false;
    }
  }

  isVaultInitialized() {
    return this.#storage.isVaultInitialized();
  }

  isUnlocked() {
    return Auth.isUnlocked;
  }

  showPrivateKey() {
    return this.accountManager.showPrivateKey();
  }

  async getAccount(key: AccountKey): Promise<Account | undefined> {
    return this.accountManager.getAccount(key);
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.accountManager.getAll();
  }

  async derivateAccount(name: string): Promise<boolean> {
    const { vault } = await this.#storage.getStorage().get(VAULT);
    const decrypted = await this.#auth.decryptVault(vault);

    await this.accountManager.derivateAccount(name, decrypted);
    return true;
  }
}
