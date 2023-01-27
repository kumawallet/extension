import PolkadotKeyring from "@polkadot/ui-keyring";
import Auth from "../storage/Auth";
import { Account } from "../storage/entities/Accounts";
import Keyring from "../storage/entities/Keyring";
import Vault from "../storage/entities/Vault";
import AccountManager, { AccountType } from "./AccountManager";

export default class WASMHandler extends AccountManager {
  type = AccountType.WASM;

  async addAccount(
    seed: string,
    name: string,
    _path: string = seed,
    keyring?: Keyring
  ): Promise<void> {
    const wallet = PolkadotKeyring.addUri(seed, Auth.password);
    const { address } = wallet.json || {};
    const key = this.formatAddress(address);
    const value = { name, address, keyring: key };
    const account = new Account(key, value);
    await this.saveAccount(account);
    const privateKey = wallet.pair.meta.privateKey;
    console.log("privateKey", privateKey)
    const _keyring = keyring || new Keyring(key, this.type, seed, "");
    await this.saveKeyring(_keyring);
    return Promise.resolve();
  }


  export() {
    //
  }

  async derive(name: string, vault: Vault) {
    //
  }
}
