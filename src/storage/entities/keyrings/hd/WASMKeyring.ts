import Auth from "@src/storage/Auth";
import PolkadotKeyring from "@polkadot/ui-keyring";
import { mnemonicValidate } from "@polkadot/util-crypto";
import HDKeyring from "./HDKeyring";
import { AccountType } from "@src/accounts/types";
import { HDKeyPair, SupportedKeyring } from "../types";

export default class WASMKeyring extends HDKeyring {
  type = AccountType.WASM;

  getNextAccountPath(): string {
    return `/${this.getAccountIndex()}`;
  }

  isMnemonicValid(mnemonic: string): boolean {
    return mnemonicValidate(mnemonic);
  }

  getAddress(seed: string, path: string): string {
    console.log("getaddress polkadot", path);
    const wallet = PolkadotKeyring.addUri(`${seed}/${path}`, Auth.password);
    return wallet?.json?.address;
  }

  getKey(address: string): string {
    if (!this.keyPairs[address]) {
      throw new Error("Key pair not found");
    }
    const { key, path } = this.keyPairs[address] as HDKeyPair;
    console.log("get wasm key:", key, path);
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
