import AccountManager from "./AccountManagerInterface";
import { ethers } from "ethers";

import storage from "../storage";

export default class EVMHandler implements AccountManager {
  create(password: string, seed: string) {
    // validate allready exists
    // validate password
    // validate seed
    const wallet = ethers.Wallet.fromMnemonic(seed);
    console.log(wallet.privateKey)    
    storage.set({ account }, () =>
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
