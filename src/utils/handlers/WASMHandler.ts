import keyring from "@polkadot/ui-keyring";
import { Account, AccountValue } from "../storage/entities/Accounts";
import Keyring from "../storage/entities/Keyring";
import Vault from "../storage/entities/Vault";
import AccountManager, { AccountType } from "./AccountManager";

export default class WASMHandler extends AccountManager {
  type = AccountType.WASM;

  async addAccount(seed: string, name: string): Promise<void> {
    // get password from storage
    const password = "password";
    const wallet = keyring.addUri(seed, password);
    const { address } = wallet.json || {};
    const key = this.formatAddress(address);
    const value: AccountValue = { name, address };
    const account = new Account(key, value);
    await this.saveAccount(account);
    const kr = new Keyring(key, this.type, seed);
    await this.saveKeyring(kr);
    return Promise.resolve();
  }

  export() {
    //
  }

  async derive(name: string, vault: Vault) {
    //
  }
}
