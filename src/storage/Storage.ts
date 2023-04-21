import CacheAuth from "./entities/CacheAuth";
import Vault from "./entities/Vault";
import BackUp from "./entities/BackUp";
import Network from "./entities/Network";
import Settings from "./entities/settings/Settings";
import Accounts from "./entities/Accounts";
import Registry from "./entities/registry/Registry";
import Activity from "./entities/activity/Activity";
import Chains from "./entities/Chains";

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

  async init() {
    if (await Vault.alreadySignedUp()) {
      throw new Error("already_signed_up");
    }

    await this.#storage.clear();
    await Vault.init();
    await Network.init();
    await Settings.init();
    await Accounts.init();
    await BackUp.init();
    await CacheAuth.init();
    await Registry.init();
    await Activity.init();
    await Chains.init();
  }

  async resetWallet() {
    await this.#storage.clear();
  }
}
