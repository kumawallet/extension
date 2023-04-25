import CacheAuth from "./entities/CacheAuth";
import Vault from "./entities/Vault";
import BackUp from "./entities/BackUp";
import Network from "./entities/Network";
import Settings from "./entities/settings/Settings";
import Accounts from "./entities/Accounts";
import Registry from "./entities/registry/Registry";
import Activity from "./entities/activity/Activity";
import Chains from "./entities/Chains";
import Auth from "./Auth";
import AccountManager from "@src/accounts/AccountManager";

const isChrome = navigator.userAgent.match(/chrome|chromium|crios/i);

export default class Storage {
  readonly #storage: chrome.storage.StorageArea;

  private static instance: Storage;

  private constructor() {
    this.#storage = isChrome
      ? chrome.storage.local
      : window.browser.storage.local;
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

  static async init(password: string, privateKeyOrSeed: string) {
    if (await Vault.alreadySignedUp()) {
      throw new Error("already_signed_up");
    }

    await Storage.getInstance().#storage.clear();
    await CacheAuth.init();
    await Auth.getInstance().setAuth(password);
    await Network.init();
    await Chains.init();
    await Settings.init();
    await Registry.init();
    await Activity.init();
    await Vault.init();
    await Accounts.init();
    await BackUp.init();
    await AccountManager.saveBackup(privateKeyOrSeed);
  }

  async resetWallet() {
    await this.#storage.clear();
  }
}
