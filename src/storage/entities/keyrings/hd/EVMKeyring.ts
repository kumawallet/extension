import { ethers } from "ethers";
import HDKeyring from "./HDKeyring";
import { AccountType } from "@src/accounts/types";
import { HDKeyPair, SupportedKeyring } from "../types";

export default class EVMKeyring extends HDKeyring {
  type = AccountType.EVM;

  getNextAccountPath(): string {
    return `m/44'/60'/0'/0/${this.getAccountIndex()}`;
  }

  isMnemonicValid(mnemonic: string): boolean {
    return ethers.utils.isValidMnemonic(mnemonic);
  }

  getAddress(path: string): string {
    return ethers.Wallet.fromMnemonic(this.mnemonic, path)?.address;
  }

  getKey(address: string): string {
    const keyPair = this.keyPairs[address] as HDKeyPair;
    if (!keyPair) {
      throw new Error("Key pair not found");
    }
    return ethers.Wallet.fromMnemonic(this.mnemonic, keyPair.path)?.privateKey;
  }

  addKeyPair(address: string, keyPair: HDKeyPair): void {
    this.keyPairs[address] = keyPair;
  }

  static fromJSON(json: SupportedKeyring): EVMKeyring {
    const { mnemonic, keyPairs } = json as HDKeyring;
    const keyring = new EVMKeyring(mnemonic);
    Object.keys(keyPairs).forEach((address) => {
      const { path } = keyPairs[address];
      keyring.addKeyPair(address, { path });
    });
    return keyring;
  }
}
