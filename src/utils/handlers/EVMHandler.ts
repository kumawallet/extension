import AccountManager, { AccountType } from "./AccountManager";
import { ethers } from "ethers";
import Account, { AccountKey } from "../storage/Account";

export default class EVMHandler extends AccountManager {
  type = AccountType.EVM;

  private getKeyFromSeed(seed: string): AccountKey {
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const { address } = wallet || {};
    return this.formatAddress(address);
  }

  addAccount(seed: string, name: string) {
    const key = this.getKeyFromSeed(seed);
    const account = new Account(key, { name });
    const callback = () => console.log("Account created");
    this.add(account, callback);
  }

  changePassword() {
    //
  }
  signIn() {
    //
  }

  export() {
    //
  }

  derive() {
    //
  }
}
