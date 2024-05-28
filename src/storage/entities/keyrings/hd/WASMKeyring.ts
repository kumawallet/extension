import PolkadotKeyring from "@polkadot/ui-keyring";
import HDKeyring from "./HDKeyring";
import { AccountType } from "@src/accounts/types";
import { HDKeyPair, SupportedKeyring } from "../types";

export default class WASMKeyring extends HDKeyring {
  type = AccountType.WASM;

  getNextAccountPath(): string {
    return `/${this.getAccountIndex()}`;
  }

  async getAddress(seed: string, path: number): Promise<string> {
    const suri = seed + (path >= 0 ? `//${path}` : "");
    const wallet = PolkadotKeyring.createFromUri(suri);
    return wallet.address;
  }

  getDerivedPath(seed: string, path: number): string {
    return `${seed}//${path}`;
  }

  getKey(address: string): string {
    if (!this.keyPairs[address]) {
      throw new Error("Key pair not found");
    }
    const { key, path } = this.keyPairs[address] as HDKeyPair;
    return `${key}${path}`;
  }

  static fromJSON(json: SupportedKeyring): WASMKeyring {
    const { mnemonic, keyPairs } = json as HDKeyring;
    const keyring = new WASMKeyring(mnemonic);
    Object.keys(keyPairs).forEach((address) => {
      const { path, key } = keyPairs[address];
      keyring.addKeyPair(address, { path, key });
    });
    return keyring;
  }
}
