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

  getAddress(path: string): string {
    const wallet = PolkadotKeyring.addUri(
      `${this.mnemonic}${path}`,
      Auth.password
    );
    return wallet?.json?.address;
  }

  getKey(address: string): string {
    if (!this.keyPairs[address]) {
      throw new Error("Key pair not found");
    }
    const { path } = this.keyPairs[address] as HDKeyPair;
    return `${this.mnemonic}${path}`;
  }

  static fromJSON(json: SupportedKeyring): WASMKeyring {
    const { mnemonic, keyPairs } = json as HDKeyring;
    const keyring = new WASMKeyring(mnemonic);
    Object.keys(keyPairs).forEach((address) => {
      const { path } = keyPairs[address];
      keyring.addKeyPair(address, { path });
    });
    return keyring;
  }
}
