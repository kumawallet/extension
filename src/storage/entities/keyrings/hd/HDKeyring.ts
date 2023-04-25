import { AccountType } from "@src/accounts/types";
import HDKeyPair from "./HDKeyPair";
import Keyring from "../Keyring";

export default abstract class HDKeyring extends Keyring {
  abstract type: AccountType;
  readonly #mnemonic: string;

  constructor(mnemonic: string) {
    super();
    if (!this.isMnemonicValid(mnemonic)) {
      throw new Error("Invalid mnemonic");
    }
    this.#mnemonic = mnemonic;
  }

  get mnemonic() {
    return this.#mnemonic;
  }

  abstract isMnemonicValid(mnemonic: string): boolean;

  abstract getNextAccountPath(): string;

  abstract getAddress(path: string): string;

  deriveKeyPair(): string {
    const path = this.getNextAccountPath();
    const address = this.getAddress(path);
    const keyPair = new HDKeyPair(path);
    this.addKeyPair(address, keyPair);
    return address;
  }

  toJSON() {
    return {
      mnemonic: this.#mnemonic,
      accountQuantity: this.accountQuantity,
      keyPairs: this.keyPairs,
    };
  }
}
