import Account, { AccountKey } from "./Account";

export default class Vault {
  #accounts: { [key: AccountKey]: Account };

  constructor() {
    this.#accounts = {};
  }

  get accounts() {
    return this.#accounts;
  }

  isEmpty() {
    return Object.keys(this.#accounts).length === 0;
  }

}
