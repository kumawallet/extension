import AccountManager from "./AccountManagerInterface";
import { ethers } from "ethers";

import Storage from "../storage/Storage";

export default class EVMHandler implements AccountManager {

  #storage: Storage;

  constructor() {
    this.#storage = new Storage();
  }

  create(password: string, seed: string) {
    // validate allready exists
    // validate password
    // validate seed
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const account = {
      password,
      seed,
      address: wallet.address,
    }
    const key = `EVM-${wallet.address}`;
    this.#storage.saveAccount(key,account, () =>
      console.log("Account created")
    );
  }
  import(password: string, seed: string) {}
  changeName() {}
  changePassword() {}
  signIn() {}
  forget() {}
  export() {}
  get() {}
  getAll() {}
  derive() {}
}
