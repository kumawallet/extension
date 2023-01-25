import Account, { AccountKey, AccountValue } from "./Account";

const VAULT = "vault";

export default class Storage {
  #storage: chrome.storage.StorageArea;
  constructor() {
    this.#storage = chrome.storage.local;
  }
  
  getStorage(): chrome.storage.StorageArea {
    return this.#storage;
  }

  //Account methods
  saveAccount(key: AccountKey, value: AccountValue, callback?: () => void) {
    this.#storage.set({ [key]: value }, callback);
  }

  removeAccount(key: string, callback?: () => void) {
    this.#storage.remove(key, callback);
  }

  async getAccount(key: AccountKey): Promise<Account|undefined> {
    const value = await this.#storage.get(key);
    // improve this validation
    if (!value?.address) return undefined;
    return new Account(key, value as AccountValue);
  }

  //Vault methods
  setVault(vault: any, callback?: () => void) {
    this.#storage.set({ vault }, callback);
  }

  removeVault(callback?: () => void) { 
    this.#storage.remove(VAULT, callback);
  }

  async getVault() {
    return this.#storage.get(VAULT);
  }
}