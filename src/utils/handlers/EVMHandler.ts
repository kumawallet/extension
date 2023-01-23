import AccountManager from "./AccountManagerInterface";
import { ethers } from "ethers";

import Storage from "../storage/Storage";

export default class EVMHandler implements AccountManager {
  #storage: Storage;

  constructor() {
    this.#storage = new Storage();
  }

  formatAddress(address: string) {
    return `EVM-${address}`;
  }

  getKeyFromSeed(seed: string) {
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const { address } = wallet || {};
    return this.formatAddress(address);
  }

  create(password: string, seed: string, name: string) {
    const key = this.getKeyFromSeed(seed);

    const account = {
      name,
      password,
    };

    this.#storage.saveAccount(key, account, () =>
      console.log("Account created")
    );
  }

  async import(password: string, seed: string) {
    const key = this.getKeyFromSeed(seed);
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

  changeName() {}
  changePassword() {}
  signIn() {}
  forget() {}
  export() {}
  get() {}
  getAll() {}
  derive() {}
}
