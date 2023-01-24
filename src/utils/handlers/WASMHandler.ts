import keyring from "@polkadot/ui-keyring";
import Account from "../storage/Account";
import AccountManager, { AccountType } from "./AccountManager";

export default class WASMHandler extends AccountManager {
  type = AccountType.WASM;

  addAccount(seed: string, name: string): Promise<void> {
    // get password from storage
    const password = "password";
    const wallet = keyring.addUri(seed, password);
    const { address } = wallet.json || {};
    const key = this.formatAddress(address)
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
