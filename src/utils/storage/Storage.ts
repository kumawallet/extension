import Account, { AccountKey } from "./Account";

export default class Storage {
  #storage: chrome.storage.StorageArea;
  constructor() {
    this.#storage = chrome.storage.local;
  }
  
  getStorage(): chrome.storage.StorageArea {
    return this.#storage;
  }

  saveAccount(key: AccountKey, value: any, callback?: () => void) {
    this.#storage.set({ [key]: value }, callback);
  }

  async getAccount(key: AccountKey): Promise<Account> {
    const value = await this.#storage.get(key);
    if (!value) throw new Error("Account not found");
    return new Account(key, value);
  }

  removeAccount(key: string, callback?: () => void) {
    this.#storage.remove(key, callback);
  }

  savePassword(password: string, callback?: () => void) {
    this.#storage.set({ password }, callback);
  }
}