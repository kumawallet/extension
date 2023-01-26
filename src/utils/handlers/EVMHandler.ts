import AccountManager, { AccountType } from "./AccountManager";
import { ethers } from "ethers";
import { Account, AccountValue } from "../storage/entities/Accounts";
import Keyring from "../storage/entities/Keyring";

export default class EVMHandler extends AccountManager {
  type = AccountType.EVM;

  async addAccount(seed: string, name: string): Promise<void> {
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const { address } = wallet || {};
    const key = this.formatAddress(address);
    const value: AccountValue = { name, address };
    const account = new Account(key, value);
    await this.saveAccount(account);
    const keyring = new Keyring(key, AccountType.EVM, seed);
    await this.saveKeyring(keyring);
    return Promise.resolve();
  }

  export() {
    //
  }

  derive() {
    //
  }
}
