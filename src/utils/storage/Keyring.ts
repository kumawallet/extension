import { BrowserStore } from "./BrowserStore";

export default class Keyring {
  #accounts;
  #addresses;
  #contracts;
  #keyring;
  #store;

  constructor() {
    this.#accounts = accounts;
    this.#addresses = addresses;
    this.#contracts = contracts;
    this.#store = new BrowserStore();
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
