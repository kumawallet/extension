
export default class Keyring {
  #accounts;
  #addresses;
  #contracts;

  constructor() {
    this.#accounts = new BrowserStore();
    this.#addresses = new BrowserStore();
    this.#contracts = new BrowserStore();
  }
  get accounts() {
    return this.#accounts;
  }
  get addresses() {
    return this.#addresses;
  }
  get contracts() {
    return this.#contracts;
  }
  get keyring() {
    if (this.#keyring) {
      return this.#keyring;
    }
    throw new Error("Keyring should be initialised before use");
  }
}
