import {
  ACCOUNTS,
  BACKUP,
  CACHE_AUTH,
  NETWORK,
  SELECTED_ACCOUNT,
  SETTINGS,
  VAULT,
} from "../utils/constants";
import { Account, AccountKey, Accounts } from "./entities/Accounts";
import Auth from "./Auth";
import CacheAuth from "./entities/CacheAuth";
import Vault from "./entities/Vault";
import { Settings } from "./entities/Settings";
import Keyring from "./entities/Keyring";
import { Network } from "./entities/Network";

const isChrome = navigator.userAgent.match(/chrome|chromium|crios/i);

export type Browser = typeof chrome | typeof window.browser;

export default class Storage {
  readonly #storage: chrome.storage.StorageArea;
  readonly #browser: Browser;

  private static instance: Storage;

  private constructor() {
    this.#browser = isChrome ? chrome : window.browser;
    this.#storage = this.#browser.storage.local;
  }

  static getInstance() {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }
    return Storage.instance;
  }

  get storage() {
    return this.#storage;
  }

  get browser() {
    return this.#browser;
  }

  async getSalt() {
    const { appName, platform, userAgent, language } = navigator;
    const extensionId = this.#browser.runtime.id;
    return `${appName}-${platform}-${userAgent}-${language}-${extensionId}`;
  }

  async get(key: string) {
    try {
      const data = await this.#storage.get(key);
      if (!data?.[key]) return undefined;
      if (key === VAULT && data[key]) {
        if (!Auth.password || !Auth.isUnlocked) {
          await this.loadFromCache();
        }
        return Auth.getInstance().decryptVault(data[key]);
      }
      if (typeof data[key] === "string") return data[key];
      return { ...data[key] };
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  async set(key: string, data: any) {
    try {
      if (key === VAULT) {
        data = await Auth.getInstance().encryptVault(data);
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

  async init(force = false) {
    try {
      if (!force) {
        if (await this.alreadySignedUp()) {
          throw new Error("Vault already initialized");
        }
      }
      await this.#storage.clear();
      const accounts = new Accounts();
      await this.set(ACCOUNTS, accounts);
      const selectedAccount = undefined;
      await this.set(SELECTED_ACCOUNT, selectedAccount);
      const settings = Settings.init();
      await this.set(SETTINGS, settings);
      const vault = new Vault();
      await this.set(VAULT, vault);
      await this.set(CACHE_AUTH, CacheAuth.getInstance());
      const network = new Network();
      await this.set(NETWORK, network);
      const backup = undefined;
      await this.set(BACKUP, backup);
      return;
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  async resetWallet() {
    try {
      await this.#storage.clear();
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  async cachePassword() {
    try {
      if (!Auth.password) {
        return;
      }
      const salt = await this.getSalt();
      const encrypted = await Auth.generateSaltedHash(salt, Auth.password);
      CacheAuth.save(encrypted);
      await this.set(CACHE_AUTH, CacheAuth.getInstance());
    } catch (error) {
      console.error(error);
      CacheAuth.clear();
    }
  }

  async loadFromCache() {
    try {
      await this.getCacheAuth();
      await Auth.loadAuthFromCache(await Storage.getInstance().getSalt());
    } catch (error) {
      console.error(error);
      CacheAuth.clear();
    }
  }

  async clearCache() {
    try {
      CacheAuth.clear();
      await this.set(CACHE_AUTH, CacheAuth.getInstance());
    } catch (error) {
      console.error(error);
    }
  }

  private async getCacheAuth() {
    const stored = await this.get(CACHE_AUTH);
    if (!stored) return;
    const cacheAuth = CacheAuth.getInstance();
    cacheAuth.set(stored);
  }

  async getVault(): Promise<Vault | undefined> {
    const stored = await this.get(VAULT);
    if (!stored || !stored.keyrings) return undefined;
    const vault = new Vault();
    vault.set(stored.keyrings);
    return vault;
  }

  async setVault(vault: Vault) {
    try {
      await this.set(VAULT, vault);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async removeVault() {
    try {
      await this.remove(VAULT);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async alreadySignedUp(): Promise<boolean> {
    const stored = await this.#storage.get(null);
    return !!stored && stored[VAULT];
  }

  async saveKeyring(keyring: Keyring) {
    try {
      const vault = await this.getVault();
      if (!vault) throw new Error("Vault is not initialized");
      vault.add(keyring);
      await this.setVault(vault);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async removeKeyring(keyring: any) {
    try {
      const vault = await this.getVault();
      if (!vault) throw new Error("Vault is not initialized");
      vault.remove(keyring);
      await this.setVault(vault);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getAccounts(): Promise<Accounts | undefined> {
    const stored = await this.get(ACCOUNTS);
    if (!stored || !stored.data) return undefined;
    const accounts = new Accounts();
    accounts.set(stored.data);
    return accounts;
  }

  async setAccounts(accounts: Accounts) {
    try {
      await this.set(ACCOUNTS, accounts);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async removeAccounts() {
    try {
      await this.remove(ACCOUNTS);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getAccount(key: AccountKey): Promise<Account | undefined> {
    const accounts = await this.getAccounts();
    if (!accounts) throw new Error("Accounts are not initialized");
    return accounts.get(key);
  }

  async addAccount(account: Account) {
    try {
      const accounts = await this.getAccounts();
      if (!accounts) throw new Error("Accounts are not initialized");
      if (accounts.allreadyExists(account.key)) {
        throw new Error("Account already exists");
      }
      accounts.add(account);
      await this.setAccounts(accounts);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async updateAccount(account: Account) {
    const accounts = await this.getAccounts();
    if (!accounts) throw new Error("Accounts are not initialized");
    accounts.update(account.key, account.value);
    await this.setAccounts(accounts);
    return account;
  }

  async removeAccount(key: AccountKey) {
    try {
      const accounts = await this.getAccounts();
      if (!accounts) throw new Error("Accounts are not initialized");
      accounts.remove(key);
      await this.setAccounts(accounts);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getSelectedAccount(): Promise<Account | undefined> {
    const selectedAccount = await this.get(SELECTED_ACCOUNT);
    if (!selectedAccount) {
      const accounts = await this.getAccounts();
      if (!accounts) throw new Error("Accounts are not initialized");
      const account = accounts.first();
      if (!account) throw new Error("No account found");
      this.setSelectedAccount(account);
      return account;
    }
    return this.getAccount(selectedAccount?.key);
  }

  async setSelectedAccount(account: Account) {
    try {
      await this.set(SELECTED_ACCOUNT, account);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async setNetwork(network: Network) {
    try {
      await this.set(NETWORK, network);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getNetwork(): Promise<Network> {
    const stored = await this.get(NETWORK);
    const defaultNetwork = Network.getDefaultNetwork();
    if (!stored || !stored.chain) {
      await this.setNetwork(defaultNetwork);
      return defaultNetwork;
    }
    const network = new Network();
    network.set(stored.chain);
    return network;
  }

  async setBackup(backup: string) {
    await this.set(BACKUP, backup);
  }

  async getBackup(): Promise<string | undefined> {
    return this.get(BACKUP);
  }

  async getSettings(): Promise<Settings | undefined> {
    const stored = await this.get(SETTINGS);
    if (!stored) return undefined;
    const settings = new Settings();
    settings.set(stored.data);
    return settings;
  }
}
