import keyring from "@polkadot/ui-keyring";
import Account, { AccountKey } from "../storage/Account";
import AccountManager, { AccountType } from "./AccountManager";

export default class WASMHandler extends AccountManager {
  type = AccountType.WASM;

  private getKeyFromSeed(seed: string, password: string): AccountKey {
    const wallet = keyring.addUri(seed, password);
    const { address } = wallet.json || {};
    return this.formatAddress(address);
  }

  addAccount(seed: string, name: string) {
    // get password from storage
    const password = "password";
    const key = this.getKeyFromSeed(seed, password);
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
