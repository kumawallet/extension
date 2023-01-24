import AccountManager, { AccountType } from "./AccountManager";
import { ethers } from "ethers";
import Account from "../storage/Account";

export default class EVMHandler extends AccountManager {
  type = AccountType.EVM;

  addAccount(seed: string, name: string): Promise<void> {
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const { address } = wallet || {};
    const key = this.formatAddress(address);
    const value = { name, address, privateKey: seed };
    const account = new Account(key, value);
    const callback = () => console.log("Account created");
    this.add(account, callback);
    return Promise.resolve();
  }

  export() {
    //
  }

  derive() {
    //
  }
}
