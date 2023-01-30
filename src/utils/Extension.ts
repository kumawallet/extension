import { VAULT } from "./constants";
import AccountManager, { AccountType } from "./AccountManager";
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

  async signUp({ seed, name, password }: any) {
    // Stores password in memory
    await this.#auth.signUp({ password });
    // Initializes the storage
    await this.#storage.init();
    // Caches the password
    await this.#storage.cachePassword();
    // Adds the account to storage
    this.addAccounts({ name, seed });
  }

  async addAccounts({ seed, name }: any) {
    await AccountManager.addEVMAccount(seed, name);
    await AccountManager.addWASMAccount(seed, name);
  }

  removeAccount(key: AccountKey) {
    AccountManager.forget(key);
  }

  changeAccountName({ key, newName }: any) {
    AccountManager.changeName(key, newName);
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
    return AccountManager.showPrivateKey();
  }

  async getAccount(key: AccountKey): Promise<Account | undefined> {
    return AccountManager.getAccount(key);
  }

  async getAllAccounts() {
    const accounts = await AccountManager.getAll();
    if (!accounts) return [];
    return accounts.getAll();
  }

  async derivateAccount(name: string, type: AccountType): Promise<Account> {
    const vault = await this.#storage.getVault();
    if (!vault) throw new Error("Vault not found");
    return AccountManager.derive(name, vault, type);
  }
}
