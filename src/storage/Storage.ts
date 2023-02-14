import {
  ACCOUNTS,
  BACKUP,
  CACHE_AUTH,
  NETWORK,
  SELECTED_ACCOUNT,
  SETTINGS,
  VAULT,
} from "../utils/constants";
import { Accounts } from "./entities/Accounts";
import Auth from "./Auth";
import CacheAuth from "./entities/CacheAuth";
import Vault from "./entities/Vault";
import { Settings } from "./entities/settings/Settings";
import { Network } from "./entities/Network";
import BackUp from "./entities/BackUp";

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
          await CacheAuth.loadFromCache();
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
      await Settings.init();
      await BackUp.init();
      const accounts = new Accounts();
      await this.set(ACCOUNTS, accounts);
      const selectedAccount = undefined;
      await this.set(SELECTED_ACCOUNT, selectedAccount);
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

  async resetWallet() {
    try {
      await this.#storage.clear();
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  async alreadySignedUp(): Promise<boolean> {
    const stored = await this.#storage.get(null);
    return !!stored && stored[VAULT];
  }
}
