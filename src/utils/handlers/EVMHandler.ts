import AccountManager, { AccountType } from "./AccountManager";
import { ethers } from "ethers";
import { Account } from "../storage/entities/Accounts";
import Keyring from "../storage/entities/Keyring";
import { ACCOUNT_PATH } from "../constants";

export default class EVMHandler extends AccountManager {
  type = AccountType.EVM;

  async addAccount(
    seed: string,
    name: string,
    path: string = ACCOUNT_PATH,
    keyring?: Keyring
  ): Promise<void> {
    const { address, privateKey } =
      ethers.Wallet.fromMnemonic(seed, path) || {};
    const key = this.formatAddress(address);
    const value = { name, address, keyring: key };
    const account = new Account(key, value);
    await this.saveAccount(account);
    const _keyring = keyring || new Keyring(key, this.type, seed, privateKey);
    await this.saveKeyring(_keyring);
    return Promise.resolve();
  }

  export() {
    //
  }
}
