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

  getAddress(seed: string, path: string): string {
    console.log("getaddress evm", path);

    return ethers.Wallet.fromMnemonic(seed, `m/44'/60'/0'/0/${path}`)?.address;
  }

  getKey(address: string): string {
    const keyPair = this.keyPairs[address] as HDKeyPair;
    if (!keyPair) {
      throw new Error("Key pair not found");
    }
    console.log("get evm key:", keyPair.key, keyPair.path);
    return ethers.Wallet.fromMnemonic(keyPair.key, keyPair.path)?.privateKey;
  }

  addKeyPair(address: string, keyPair: HDKeyPair): void {
    this.keyPairs[address] = keyPair;
  }

  static fromJSON(json: SupportedKeyring): EVMKeyring {
    const { mnemonic, keyPairs } = json as HDKeyring;
    const keyring = new EVMKeyring(mnemonic);
    Object.keys(keyPairs).forEach((address) => {
      const { path, key } = keyPairs[address];
      keyring.addKeyPair(address, { path, key });
    });
    return keyring;
  }
}
