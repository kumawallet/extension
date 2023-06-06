import { AccountType } from "@src/accounts/types";
import { KeyPair, HDKeyPair } from "./types";

export default abstract class Keyring {
  abstract readonly type: AccountType;
  keyPairs: { [address: string]: KeyPair | HDKeyPair } = {};

  addKeyPair(address: string, keyPair: KeyPair | HDKeyPair): void {
    this.keyPairs[address] = keyPair;
  }

  getAccountIndex() {
    return Object.keys(this.keyPairs).length;
  }

  abstract getKey(address: string): string;
}
