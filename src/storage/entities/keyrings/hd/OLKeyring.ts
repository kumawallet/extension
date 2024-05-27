import { AccountType } from "@src/accounts/types";
import HDKeyring from "./HDKeyring";
import { SupportedKeyring } from "../types";
import { createOLAccountFromMnemonic } from "@src/services/ol/ol-utils";

export default class OLKeyring extends HDKeyring {
  type = AccountType.OL;

  getNextAccountPath(): string {
    return `/${this.getAccountIndex()}`;
  }

  async getAddress(seed: string, path?: number): Promise<string> {
    return createOLAccountFromMnemonic(seed, path);
  }

  getKey(address: string): string {
    if (!this.keyPairs[address]) {
      throw new Error("Key pair not found");
    }
    const { key, path } = this.keyPairs[address];
    return `${key}${path}`;
  }

  static fromJSON(json: SupportedKeyring): OLKeyring {
    const { mnemonic, keyPairs } = json as HDKeyring;
    const keyring = new OLKeyring(mnemonic);
    Object.keys(keyPairs).forEach((address) => {
      const { path, key } = keyPairs[address];
      keyring.addKeyPair(address, { path, key });
    });
    return keyring;
  }
}
