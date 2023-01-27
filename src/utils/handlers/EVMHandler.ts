import AccountManager, { AccountType } from "./AccountManager";
import { ethers } from "ethers";
import { Account, AccountValue } from "../storage/entities/Accounts";
import Keyring from "../storage/entities/Keyring";
import Vault from "../storage/entities/Vault";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { ACCOUNT_PATH } from "../constants";

export default class EVMHandler extends AccountManager {
  type = AccountType.EVM;

  async addAccount(
    seed: string,
    name: string,
    path: string = ACCOUNT_PATH,
    keyring?: Keyring
  ): Promise<void> {
    const wallet = ethers.Wallet.fromMnemonic(seed, path);
    const { address } = wallet || {};
    const key = this.formatAddress(address);
    const value: AccountValue = { name, address };
    const account = new Account(key, value);
    await this.saveAccount(account);

    const _keyring = keyring || new Keyring(key, this.type, seed);
    console.log({
      createdKeyring: _keyring,
    });
    _keyring.accountQuantity = _keyring.accountQuantity + 1;

    await this.saveKeyring(_keyring);
    return Promise.resolve();
  }

  export() {
    //
  }

  async derive(name: string, vault: Vault) {
    //
    console.log("EVMHandler.derive");

    // TODO: fix keyrings.keyrings
    const keyrings: any = vault.keyrings?.keyrings;

    // TODO: make condition to imported accounts
    const keyringIndex = Object.keys(keyrings).find((keyring) =>
      keyring.includes(this.type)
    );

    if (!keyringIndex) {
      const seed = mnemonicGenerate(12);
      return this.addAccount(seed, name);
    }

    const foundKeyring = {
      ...keyrings[keyringIndex as string],
      key: keyringIndex,
    };
    const { path, accountQuantity, seed } = foundKeyring;
    const newPath = this.generateSeedOrPath(path, accountQuantity);
    await this.addAccount(seed, name, newPath, foundKeyring);
    return;
  }

  generateSeedOrPath(pathOrSeed: string, accountQuantity: number) {
    const newPath = pathOrSeed.slice(0, -1) + (accountQuantity + 1);
    return newPath;
  }
}
