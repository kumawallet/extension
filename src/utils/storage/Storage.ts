export default class Storage {
  #storage: chrome.storage.StorageArea;
  constructor() {
    this.#storage = chrome.storage.local;
  }
  saveAccount(key: string, value: any, callback?: () => void) {
    this.#storage.set({ [key]: value }, callback);
  }
  getStorage(): chrome.storage.StorageArea {
    return this.#storage;
  }
}
