import Auth from "@src/storage/Auth";
import PolkadotKeyring from "@polkadot/ui-keyring";
import { mnemonicValidate } from "@polkadot/util-crypto";
import HDKeyring from "./HDKeyring";
import HDKeyPair from "./HDKeyPair";
import { AccountType } from "@src/accounts/types";

export default class WASMKeyring extends HDKeyring {
  type = AccountType.WASM;

  getNextAccountPath(): string {
    return `/${this.accountQuantity}`;
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

  getPrivateKey(address: string): string {
    if (!this.keyPairs[address]) {
      throw new Error("Key pair not found");
    }
    const { path } = this.keyPairs[address] as HDKeyPair;
    const wallet = PolkadotKeyring.addUri(
      `${this.mnemonic}${path}`,
      Auth.password
    );
    if (!wallet?.pair?.meta?.privateKey) {
      return this.mnemonic;
    }
    return wallet.pair.meta.privateKey.toString();
  }

  fromJSON(json: any): void {
    this.accountQuantity = json.accountQuantity;
    this.keyPairs = {};
    Object.keys(json.keyPairs).forEach((address) => {
      const { path } = json.keyPairs[address];
      this.addKeyPair(address, new HDKeyPair(path));
    });
  }
}
