export default class Storage {
  #storage: chrome.storage.StorageArea;
  constructor() {
    this.#storage = chrome.storage.local;
  }
  set(key: string, value: any) {
    this.#storage.set({ [key]: value }, () => console.log({ key, value }));
  }
  get(key: string) {
    this;
  }
}
