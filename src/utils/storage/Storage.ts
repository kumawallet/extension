import { ACCOUNTS, SELECTED_ACCOUNT, SETTINGS, VAULT } from "../constants";
import { Account, AccountKey, Accounts } from "./entities/Accounts";
import Auth from "./Auth";
import CacheAuth from "./entities/CacheAuth";
import Vault from "./entities/Vault";
import { Settings } from "./entities/Settings";

export abstract class Storable {
  key: string;

  constructor(key: string) {
    this.key = key;
  }

  getKey(): string {
    return this.key;
  }
}

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
      if (!data) throw new Error("Data not found");
      if (key === VAULT && data[key]) {
        return this.#auth.decryptVault(data[key]);
      }
      return data;
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  async set(key: string, data: any) {
    try {
      if (key === VAULT) {
        data = await this.#auth.encryptVault(data);
      }
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
      this.set(ACCOUNTS, accounts);
      const settings = new Settings();
      this.set(SETTINGS, settings);
      const vault = new Vault();
      this.set(VAULT, vault);
      const cacheAuth = CacheAuth.getInstance();
      this.set(cacheAuth.getKey(), cacheAuth);
      const selectedAccount = undefined;
      this.set(SELECTED_ACCOUNT, selectedAccount);
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  async cachePassword() {
    try {
      CacheAuth.save(Auth.password);
      const cacheAuth = CacheAuth.getInstance();
      this.set(cacheAuth.getKey(), cacheAuth);
    } catch (error) {
      console.error(error);
      CacheAuth.clear();
    }
  }

  async getVault() {
    return this.get(VAULT);
  }

  async setVault(vault: Vault) {
    this.set(VAULT, vault);
  }

  async removeVault() {
    this.remove(VAULT);
  }

  async isVaultInitialized(): Promise<boolean> {
    const vault = await this.getVault();
    return !vault.isEmpty();
  }

  async getAccounts(): Promise<Accounts> {
    const accounts = await this.get(ACCOUNTS);
    if (!accounts) throw new Error("Accounts are not initialized");
    return accounts as Accounts;
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
