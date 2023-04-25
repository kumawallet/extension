import { AccountType } from "@src/accounts/types";
import HDKeyPair from "./hd/HDKeyPair";
import KeyPair from "./imported/KeyPair";

export default abstract class Keyring {
  abstract readonly type: AccountType;
  protected keyPairs: { [address: string]: KeyPair | HDKeyPair } = {};
  protected accountQuantity = 0;

  increaseAccountQuantity() {
    this.accountQuantity++;
  }

  decreaseAccountQuantity() {
    this.accountQuantity--;
  }

  addKeyPair(address: string, keyPair: KeyPair | HDKeyPair): void {
    this.keyPairs[address] = keyPair;
    this.increaseAccountQuantity();
  }

  abstract getPrivateKey(address: string): string;

  abstract fromJSON(json: any): void;
}
