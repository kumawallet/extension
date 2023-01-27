import { ACCOUNTS, SELECTED_ACCOUNT, SETTINGS, VAULT } from "../constants";
import { Account, AccountKey, Accounts } from "./entities/Accounts";
import Auth from "./Auth";
import CacheAuth from "./entities/CacheAuth";
import Vault from "./entities/Vault";
import { Settings } from "./entities/Settings";

export default class Storage {
  readonly #storage: chrome.storage.StorageArea;
  #auth: Auth;

  private static instance: Storage;

  private constructor() {
    this.#storage = chrome.storage.local;
    this.#auth = Auth.getInstance();
  }

  static getInstance() {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }
    return Storage.instance;
  }

  getStorage(): chrome.storage.StorageArea {
    return this.#storage;
  }

  async get(key: string) {
    try {
      const data = await this.#storage.get(key);
      if (!data[key]) return undefined;
      if (key === VAULT && data[key]) {
        await this.loadCache();
        if (!Auth.password || !Auth.isUnlocked) {
          Auth.setAuth(CacheAuth.getInstance());
        }
        return this.#auth.decryptVault(data[key]);
      }
      return { ...data[key] };
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  async set(key: string, data: any) {
    try {
      if (key === VAULT) {
        const keyrings = data.keyrings;
        data = await this.#auth.encryptVault({ ...data, keyrings });
      }

      /*const dataIsObject = typeof data === "object";

      let _data = dataIsObject ? { ...data } : data;

      if (data?.[key]) {
        _data = data[key];

        if (dataIsObject && Object.keys(_data).length === 0) {
          _data = undefined;
        }
      } else {
        _data && delete _data?.["key"];
      }*/

      //await this.#storage.set({ [key]: _data });
      await this.#storage.set({ [key]: data });
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  async remove(key: string, callback?: () => void) {
    try {
      await this.#storage.remove(key, callback);
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  async init() {
    try {
      const accounts = new Accounts();
      await this.set(ACCOUNTS, accounts);
      const settings = new Settings();
      await this.set(SETTINGS, settings);
      const vault = new Vault();
      await this.set(VAULT, vault);
      const cacheAuth = CacheAuth.getInstance();
      await this.set(cacheAuth.getKey(), cacheAuth);
      const selectedAccount = undefined;
      await this.set(SELECTED_ACCOUNT, selectedAccount);
      console.log("Storage initialized");
      console.log(await this.#storage.get(null));
      return;
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  async cachePassword() {
    try {
      const password = Auth.password || "";
      CacheAuth.save(password);
      const cacheAuth = CacheAuth.getInstance();
      await this.set(cacheAuth.getKey(), cacheAuth);
    } catch (error) {
      console.error(error);
      CacheAuth.clear();
    }
  }

  async loadCache() {
    try {
      const cacheAuth = await this.getCacheAuth();
      Auth.setAuth(cacheAuth);
    } catch (error) {
      console.error(error);
      CacheAuth.clear();
    }
  }

  async getCacheAuth(): Promise<CacheAuth> {
    const stored = await this.get(CacheAuth.getInstance().getKey());
    if (!stored) throw new Error("CacheAuth is not initialized");
    const cacheAuth = CacheAuth.getInstance();
    cacheAuth.set(stored);
    return cacheAuth;
  }

  async getVault(): Promise<Vault | undefined> {
    const stored = await this.get(VAULT);
    if (!stored) return undefined;
    const vault = new Vault();
    vault.set(stored);
    return vault;
  }

  async setVault(vault: Vault) {
    this.set(VAULT, vault);
  }

  async removeVault() {
    this.remove(VAULT);
  }

  async isVaultInitialized(): Promise<boolean> {
    const vault = await this.getVault();
    if (!vault) return false;
    return !vault.isEmpty();
  }

  async getAccounts(): Promise<Accounts | undefined> {
    const stored = await this.get(ACCOUNTS);
    if (!stored || !stored.data) return undefined;
    const accounts = new Accounts();
    accounts.set(stored.data);
    return accounts;
  }

  async setAccounts(accounts: Accounts) {
    this.set(ACCOUNTS, accounts);
  }

  async getAccount(key: AccountKey): Promise<Account | undefined> {
    const accounts = await this.getAccounts();
    if (!accounts) throw new Error("Accounts are not initialized");
    return accounts.get(key);
  }

  async addAccount(account: Account) {
    const accounts = await this.getAccounts();
    if (!accounts) throw new Error("Accounts are not initialized");
    if (accounts.allreadyExists(account.key)) {
      throw new Error("Account already exists");
    }
    accounts.add(account);
    this.setAccounts(accounts);
  }

  async updateAccount(account: Account) {
    const accounts = await this.getAccounts();
    if (!accounts) throw new Error("Accounts are not initialized");
    accounts.update(account.key, account.value);
    this.setAccounts(accounts);
  }

  async removeAccount(key: AccountKey) {
    const accounts = await this.getAccounts();
    if (!accounts) throw new Error("Accounts are not initialized");
    accounts.remove(key);
    this.setAccounts(accounts);
  }

  async removeAccounts() {
    this.remove(ACCOUNTS);
  }

  async getSelectedAccount(): Promise<AccountKey | undefined> {
    const selectedAccount = await this.#storage.get(SELECTED_ACCOUNT);
    if (!selectedAccount) {
      const accounts = await this.getAccounts();
      if (!accounts) throw new Error("Accounts are not initialized");
      const account = accounts.first();
      if (!account) throw new Error("No account found");
      this.setSelectedAccount(account.key);
      return account.key;
    }
    return selectedAccount as AccountKey;
  }

  async setSelectedAccount(key: AccountKey) {
    this.set(SELECTED_ACCOUNT, key);
  }
}
