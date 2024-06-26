import { HDNodeWallet } from "ethers";
import HDKeyring from "./HDKeyring";
import { AccountType } from "@src/accounts/types";
import { HDKeyPair, SupportedKeyring } from "../types";

export default class EVMKeyring extends HDKeyring {
  type = AccountType.EVM;

  getNextAccountPath(): string {
    return `m/44'/60'/0'/0/${this.getAccountIndex()}`;
  }

  async getAddress(seed: string, path?: number): Promise<string> {
    const wallet = HDNodeWallet.fromPhrase(
      seed,
      undefined,
      `m/44'/60'/0'/0/${path || 0}`
    );
    return wallet.address;
  }

  getKey(address: string): string {
    const keyPair = this.keyPairs[address] as HDKeyPair;
    if (!keyPair) {
      throw new Error("Key pair not found");
    }
    return keyPair.key;
  }

  getDerivedPath(seed: string, path: number): string {
    const wallet = HDNodeWallet.fromPhrase(
      seed,
      undefined,
      `m/44'/60'/0'/0/${path || 0}`
    );
    return wallet.privateKey;
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
