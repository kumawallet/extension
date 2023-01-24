import keyring from "@polkadot/ui-keyring";
import AccountManager from "./AccountManagerInterface";

import Storage from "../storage/Storage";

export default class WASMHandler implements AccountManager {
  #storage: Storage;

  constructor() {
    this.#storage = new Storage();
  }

  formatAddress(address: string) {
    return `WASM-${address}`;
  }

  getKeyFromSeed(seed: string, password: string) {
    const wallet = keyring.addUri(seed, password);
    const { address } = wallet.json || {};
    return this.formatAddress(address);
  }

  create(password: string, seed: string, name: string) {
    const key = this.getKeyFromSeed(seed, password);

    const account = {
      name,
      password,
    };

    this.#storage.saveAccount(key, account, () =>
      console.log("Account created")
    );
  }

  async import(password: string, seed: string) {
    const key = this.getKeyFromSeed(seed, password);
    const exists = await this.#storage.getAccount(key);
    if (exists) {
      throw new Error("Account already exists");
    }

    const account = {
      password,
    };

    this.#storage.saveAccount(key, account, () =>
      console.log("Account imported")
    );
  }
  changeName() {
    //
  }
  changePassword() {
    //
  }
  signIn() {
    //
  }
  forget() {
    //
  }
  export() {
    //
  }
  get() {
    //
  }
  getAll(): any[] {
    // let accounts: any[] = [];
    // this.store.all((items) => (accounts = items));
    // return accounts;
  }
  derive() {
    //
  }
}
