import {
  ACCOUNTS,
  CACHE_AUTH,
  NETWORK,
  SELECTED_ACCOUNT,
  SETTINGS,
  VAULT,
} from "../constants";
import { Account, AccountKey, Accounts } from "./entities/Accounts";
import Auth from "./Auth";
import CacheAuth from "./entities/CacheAuth";
import Vault from "./entities/Vault";
import { Settings } from "./entities/Settings";
import Keyring from "./entities/Keyring";
import { Network } from "./entities/Network";

const isChrome = navigator.userAgent.match(/chrome|chromium|crios/i);

export default class Storage {
  readonly #storage: chrome.storage.StorageArea;

  private static instance: Storage;

  private constructor() {
    this.#storage = isChrome
      ? chrome.storage.local
      : window.browser.storage.local; // add browser to namespace?
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
      if (!data?.[key]) return undefined;
      if (key === VAULT && data[key]) {
        await this.loadCache();
        if (!Auth.password || !Auth.isUnlocked) {
          Auth.setAuth(CacheAuth.getInstance());
        }
        return Auth.getInstance().decryptVault(data[key]);
      }
      return { ...data[key] };
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  async getAll() {
    return this.#storage.get(null);
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
        if (await this.isVaultInitialized()) {
          throw new Error("Vault already initialized");
        }
      }
      const accounts = new Accounts();
      await this.set(ACCOUNTS, accounts);
      const selectedAccount = undefined;
      await this.set(SELECTED_ACCOUNT, selectedAccount);
      const settings = new Settings();
      await this.set(SETTINGS, settings);
      const vault = new Vault();
      await this.set(VAULT, vault);
      await this.set(CACHE_AUTH, CacheAuth.getInstance());
      const network = new Network();
      await this.set(NETWORK, network);
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

  async isVaultInitialized(): Promise<boolean> {
    const vault = await this.getVault();
    if (!vault) return false;
    return !vault.isEmpty();
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
    try {
      const accounts = await this.getAccounts();
      if (!accounts) throw new Error("Accounts are not initialized");
      accounts.update(account.key, account.value);
      await this.setAccounts(accounts);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
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
}
