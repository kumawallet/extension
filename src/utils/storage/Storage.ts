import Account, { AccountKey, AccountValue } from "./Account";

export default class Storage {
  #storage: chrome.storage.StorageArea;
  constructor() {
    this.#storage = chrome.storage.local;
  }
  
  getStorage(): chrome.storage.StorageArea {
    return this.#storage;
  }

  saveAccount(key: AccountKey, value: AccountValue, callback?: () => void) {
    this.#storage.set({ [key]: value }, callback);
  }

  async getAccount(key: AccountKey): Promise<Account|undefined> {
    const value = await this.#storage.get(key);
    // improve this validation
    if (!value?.address) return undefined;
    return new Account(key, value as AccountValue);
  }

  removeAccount(key: string, callback?: () => void) {
    this.#storage.remove(key, callback);
  }

  savePassword(password: string, callback?: () => void) {
    this.#storage.set({ password }, callback);
  }
}