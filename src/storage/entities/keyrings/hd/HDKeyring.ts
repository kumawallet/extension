import { AccountType } from "@src/accounts/types";
import Keyring from "../Keyring";
import { HDKeyPair } from "../types";

export default abstract class HDKeyring extends Keyring {
  abstract type: AccountType;
  readonly #mnemonic: string;
  keyPairs: { [address: string]: HDKeyPair };

  constructor(mnemonic: string) {
    super();
    if (!this.isMnemonicValid(mnemonic)) {
      throw new Error("Invalid mnemonic");
    }
    this.#mnemonic = mnemonic;
    this.keyPairs = {};
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
    this.addKeyPair(address, { path });
    return address;
  }

  toJSON() {
    return {
      mnemonic: this.#mnemonic,
      keyPairs: this.keyPairs,
    };
  }
}
