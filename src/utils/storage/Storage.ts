export default class Storage {
  #storage: chrome.storage.StorageArea;
  constructor() {
    this.#storage = chrome.storage.local;
  }
  
  getStorage(): chrome.storage.StorageArea {
    return this.#storage;
  }

  saveAccount(key: string, value: any, callback?: () => void) {
    this.#storage.set({ [key]: value }, callback);
  }

  getAccount(key: string) {
    return this.#storage.get(key);
  }
}